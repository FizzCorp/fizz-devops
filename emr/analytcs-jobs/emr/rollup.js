'use strict';

var AWS = require('aws-sdk');

const ANALYTICS_SOURCE_ROOT = process.env.ANALYTICS_SOURCE_ROOT || "com.fizz.prod.analytics/dev/events";
const ANALYTICS_OUTPUT_ROOT_METRIC = process.env.ANALYTICS_OUTPUT_ROOT_METRIC || "com.fizz.prod.analytics/dev/metrics";
const ANALYTICS_SCRIPT_PATH = process.env.ANALYTICS_SCRIPT_PATH || "com.fizz.prod.analytics/internal_monthly_dev.ql";
const ANALYTICS_OUTPUT_ROOT_REPORT = process.env.ANALYTICS_OUTPUT_ROOT_REPORT || "com.fizz.prod.analytics/dev/reports";
const ANALYTICS_EMR_ROLE = process.env.ANALYTICS_EMR_ROLE || "EMR_DefaultRole";
const ANALYTICS_EC2_ROLE = process.env.ANALYTICS_EC2_ROLE || "EMR_EC2_DefaultRole";
const ANALYTICS_REGION = process.env.ANALYTICS_REGION || "us-east-1";
const ANALYTICS_INSTANCE = process.env.ANALYTICS_INSTANCE || "m3.xlarge";
const ANALYTICS_LOG_URI = process.env.ANALYTICS_LOG_URI || "";

const EVENT_TYPE_SESSION = 'session';
const EVENT_TYPE_TRANSLATION = 'trans';
const EVENT_TYPE_ACTION = 'action';
const EVENT_TYPE_LOG = 'log';

const emr = new AWS.EMR({
    "region": ANALYTICS_REGION
});

const S3 = new AWS.S3({
    "region": ANALYTICS_REGION
});

class Target {
    constructor (type, root, year, month, day, hour) {
        this.type = type;
        this.root = root;
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
    }

    URI (eventType) {
        let URI = '';

        if (this.type === Target.TYPE_S3) {
            URI = 's3n://' + this.root + '/' + this.keyPath_ (eventType, this.year, this.month, this.day, this.hour);
        }
        else
        if (this.type === Target.TYPE_HDFS) {
            URI = 'hdfs:///' + this.root + '/' + this.keyPath_ (eventType, this.year, this.month, this.day, this.hour);
        }

        return URI;
    }

    exists (eventType) {
        const self = this;

        if (self.type === Target.TYPE_HDFS) {
            return Promise.resolve (true);
        }

        return new Promise ((resolve, reject) => {
            const bucketIdx = self.root.indexOf ('/');

            if (bucketIdx <= 0) {
                reject ('Invalid root path specified: ' + self.root);
                return;
            }

            const bucket = self.root.slice (0, bucketIdx);
            const key = self.root.slice (bucketIdx+1) + '/' + self.keyPath_ (eventType);
            var params = {
                Bucket: bucket,
                Prefix: key,
                MaxKeys: 1
            };

            S3.listObjectsV2(params, function (err, data) {
                if (err) {
                    reject (err);
                }
                else {
                    resolve (data.KeyCount > 0);
                }
            });
        });
    };

    static get TYPE_S3 () {
        return 's3';
    }

    static get TYPE_HDFS () {
        return 'hdfs';
    }

    keyPath_ (prefix) {
        let path = prefix + '/';

        if (this.year != null) {
            path += 'year=' + this.year + '/';
        }

        if (this.month != null) {
            path += 'month=' + this.month + '/';
        }

        if (this.day != null) {
            path += 'day=' + this.day + '/'
        }

        if (this.hour != null) {
            path += 'hour=' + this.hour + '/'
        }

        return path;
    }
}

const deployCluster = function (steps, onDone) {
    const name = 'fizz-analytics-internal-aggregator-monthly';
    var params = {
        Instances: {
            InstanceCount: 1,
            KeepJobFlowAliveWhenNoSteps: false,
            MasterInstanceType: ANALYTICS_INSTANCE,
            Placement: {
                AvailabilityZone: 'us-east-1a'
            },
            SlaveInstanceType: ANALYTICS_INSTANCE
        },
        Name: name,
        Applications: [
            { "Name": "Ganglia"/*,"Version": "3.7.2"*/ },
            { "Name": "Hadoop"/*, "Version": "2.7.2"*/ },
            { "Name": "Hive"/*, "Version": "1.0.0"*/ },
            { "Name": "Hue"/*, "Version": "3.7.1"*/ },
            { "Name": "Mahout"/*, "Version": "0.12.2"*/ },
            { "Name": "Pig"/*, "Version": "0.14.0"*/ }
        ],
        LogUri: ANALYTICS_LOG_URI,
        ReleaseLabel: 'emr-5.6.0',
        ServiceRole: ANALYTICS_EMR_ROLE,
        JobFlowRole: ANALYTICS_EC2_ROLE,
        Steps: [
        ],
        Tags: [{
                Key: 'Name',
                Value: name
        }],
        VisibleToAllUsers: true
    };

    params.Steps = steps;

    emr.runJobFlow(params, onDone);
};

const buildDistCpStep = function (opts, srcTarget, dstTarget) {
    const step = {
        HadoopJarStep: {
            Jar: 'command-runner.jar',
            Args: [
                "s3-dist-cp",
                "--s3Endpoint=s3.amazonaws.com",
                "--src=" + srcTarget.URI (opts.eventType),
                "--dest=" + dstTarget.URI (opts.eventType)
            ]
        },
        Name: 'S3DistCp step - aggregate daily analytics of type ' + opts.eventType,
        ActionOnFailure: 'TERMINATE_JOB_FLOW'
    };

    if (opts.deleteSrc) {
        step.HadoopJarStep.Args.push ("--deleteOnSuccess");
    }

    if (opts.groupFiles) {
        const grouping = opts.groupByDay ? "--groupBy=.*(day=" + srcTarget.day + ").*" : "--groupBy=.*(month=" + srcTarget.month + ").*";
                
        step.HadoopJarStep.Args.push (grouping);
        step.HadoopJarStep.Args.push ("--targetSize=256");
        step.HadoopJarStep.Args.push ("--outputCodec=gz");
    }
    else
    if (opts.filter) {
        step.HadoopJarStep.Args.push (opts.filter);
    }

    return step;
};

const buildHiveStep = function (scriptURI, scriptParams) {
    var step = {
        HadoopJarStep: {
            Jar: 'command-runner.jar',
            Args: [
                "hive-script",
                "--run-hive-script",
                "--args",
                "-f", scriptURI,
                "-d", "INPUT=s3://fizz-analytics-data/dev/events/",
                "-d", "OUTPUT=s3://fizz-analytics-data/dev/metrics/"
            ]
        },
        Name: 'Hive program',
        ActionOnFailure: 'TERMINATE_JOB_FLOW' //'TERMINATE_JOB_FLOW | TERMINATE_CLUSTER | CANCEL_AND_WAIT | CONTINUE'
    };

    step.HadoopJarStep.Args =  step.HadoopJarStep.Args.concat(scriptParams);

    return step;
};

/**
 * The rollup AWS Lambda handler. Called at the end of each day to rollup
 * the events data (for that day) into reports that can be ingested for quick display.
 * Deploys an EMR cluster with steps to:
 * 1. Aggregate all events files into a single (or max 256 MB) file (to solve small file problem).
 * 2. Copy all relevant data from S3 to the EMR hdfs.
 * 3. Run the Hive rollup scroipts. 
 */
exports.handler = function (lambdaEvent, context, callback) {
    var steps = [];
    var ts = new Date();

    // move back by one day
    ts.setDate (ts.getDate() - 1);

    const year = ts.getFullYear ();
    const month = ts.getMonth () + 1;
    const day = ts.getDate ();

    var aggregationStep = buildHiveStep("s3://" + ANALYTICS_SCRIPT_PATH, [
        "-hiveconf", "INPUT_TABLE_SESSION='hdfs:///" + ANALYTICS_SOURCE_ROOT + "/" + EVENT_TYPE_SESSION + "/'",
        "-hiveconf", "INPUT_TABLE_TRANSLATION='hdfs:///" + ANALYTICS_SOURCE_ROOT + "/" + EVENT_TYPE_TRANSLATION + "/'",
        "-hiveconf", "INPUT_TABLE_ACTION='hdfs:///" + ANALYTICS_SOURCE_ROOT + "/" + EVENT_TYPE_ACTION + "/'",
        "-hiveconf", "INPUT_TABLE_LOG='hdfs:///" + ANALYTICS_SOURCE_ROOT + "/" + EVENT_TYPE_LOG + "/'",
        "-hiveconf", "DATE_YEAR='" + year + "'",
        "-hiveconf", "DATE_MONTH='" + month + "'",
        "-hiveconf", "DATE_DAY='" + day + "'",
        "-hiveconf", "OUTPUT_ROOT='s3n://" + ANALYTICS_OUTPUT_ROOT_METRIC + "/'",
        "-hiveconf", "OUTPUT_ROOT_REPORT='s3n://" + ANALYTICS_OUTPUT_ROOT_REPORT + "/'"
    ]);

    let targetD = new Target (Target.TYPE_S3, ANALYTICS_SOURCE_ROOT, year, month, day, null);
    let srcTargetM = new Target (Target.TYPE_S3, ANALYTICS_SOURCE_ROOT, year, month, null, null);
    let destTargetM = new Target (Target.TYPE_HDFS, ANALYTICS_SOURCE_ROOT, year, month, null, null);
    const promises = [];
    const types = [ EVENT_TYPE_SESSION, EVENT_TYPE_TRANSLATION, EVENT_TYPE_ACTION, EVENT_TYPE_LOG ];

    for (let type of types) {
        promises.push (targetD.exists (type));
    }

    Promise.all (promises)
    .then(responses => {
        for (let ti = 0; ti < types.length; ti++) {
            if (responses[ti]) {
                let opts = { 
                    eventType: types[ti], groupFiles: true, groupByDay: true, deleteSrc: true
                };
                steps.push (buildDistCpStep (opts, targetD, targetD));

                opts.groupFiles = false;
                opts.deleteSrc = false;
                opts.filter = '--srcPattern=.*(.gz|.json)';
                steps.push (buildDistCpStep (opts, srcTargetM, destTargetM));
            }
        }

        steps.push(aggregationStep);
        deployCluster(steps, callback);
    });
};
