'use strict';

const HadoopRunnerStepBuilder = require('./infra/hadoopRunnerStepBuilder');
const ApplicationSet = require('./infra/emrCluster').ApplicationSet;
const Cluster = require('./infra/emrCluster').Cluster;
const Utils = require('./utils');

const GDPR_JOB_JAR_LOCATION = process.env.GDPR_JOB_JAR_LOCATION || 'com.fizz.prod.gdpr/gdpr-job-1.0-SNAPSHOT.jar';

const GDPR_ANONYMIZE_ID = process.env.GDPR_ANONYMIZE_ID || "fizz_anonymized";
const GDPR_ANONYMIZE_NICK = process.env.GDPR_ANONYMIZE_NICK || "fizz_anonymized";

const GDPR_FIZZ_GATEWAY_URL = process.env.GDPR_FIZZ_GATEWAY_URL || "http://api.fizz.io:9310";

const GDPR_ES_HOST = process.env.GDPR_ES_HOST || 'es.fizz.internal';
const GDPR_ES_PORT = process.env.GDPR_ES_PORT || '443';
const GDPR_ES_PROTOCOL = process.env.GDPR_ES_PROTOCOL || 'https';
const GDPR_ES_REQUEST_INDEX = process.env.GDPR_ES_REQUEST_INDEX || 'gdpr_requests';
const GDPR_ES_REQUEST_RESOURCE = process.env.GDPR_ES_REQUEST_RESOURCE || 'docs';
const GDPR_ES_REQUEST_SIZE = process.env.GDPR_ES_REQUEST_SIZE || '100';
const GDPR_ES_TEXT_MESSAGE_INDEX = process.env.GDPR_ES_TEXT_MESSAGE_INDEX || 'text_messages';
const GDPR_ES_REPORTED_MESSAGES_INDEX = process.env.GDPR_ES_REPORTED_MESSAGES_INDEX || 'report_messages';

const GDPR_HBASE_ZOOKEEPER_QOURUM = process.env.GDPR_HBASE_ZOOKEEPER_QOURUM || 'hbase.fizz.internal'
const GDPR_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT = process.env.GDPR_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT || '2181'
const GDPR_HBASE_DISTRIBUTED_CLUSTERED = process.env.GDPR_HBASE_DISTRIBUTED_CLUSTERED || 'true'
const GDPR_HBASE_ZOOKEEPER_ZNODE_PARENT = process.env.GDPR_HBASE_ZOOKEEPER_ZNODE_PARENT || '/hbase-unsecure'

const GDPR_CHAT_HBASE_NAMESPACE = process.env.GDPR_CHAT_HBASE_NAMESPACE || "chat_prod";
const GDPR_CHAT_HBASE_MESSAGE_TABLE = process.env.GDPR_CHAT_HBASE_MESSAGE_TABLE || "tbl_message";
const GDPR_CHAT_HBASE_MESSAGE_CF = process.env.GDPR_CHAT_HBASE_MESSAGE_CF || "c";


const GDPR_EXTRACT_REQUESTS_JOB_CLASS = process.env.GDPR_EXTRACT_REQUESTS_JOB_CLASS || 'io.fizz.gdpr.job.extractrequests.Executor';
const GDPR_ANONYMIZE_HBASE_JOB_CLASS = process.env.GDPR_ANONYMIZE_HBASE_JOB_CLASS || 'io.fizz.gdpr.job.anonymize.hbase.Executor';
const GDPR_ANONYMIZE_ES_TEXT_MESSAGES_JOB_CLASS = process.env.GDPR_ANONYMIZE_ES_TEXT_MESSAGES_JOB_CLASS || 'io.fizz.gdpr.job.anonymize.elasticsearch.textmessages.Executor';
const GDPR_ANONYMIZE_ES_REPORTED_MESSAGES_JOB_CLASS = process.env.GDPR_ANONYMIZE_ES_REPORTED_MESSAGES_JOB_CLASS || 'io.fizz.gdpr.job.anonymize.elasticsearch.reportedmessages.Executor';
const GDPR_DELETE_GROUP_JOB_CLASS = process.env.GDPR_ANONYMIZE_HBASE_JOB_CLASS || 'io.fizz.gdpr.job.delete.group.Executor';
const GDPR_UPDATE_REQUESTS_JOB_CLASS = process.env.GDPR_UPDATE_REQUESTS_JOB_CLASS || 'io.fizz.gdpr.job.updatestatus.Executor';

exports.handler = (lambdaEvent, context, callback) => {
    const steps = [];

    const builder = new HadoopRunnerStepBuilder()
                    .jobJAR('s3://' + GDPR_JOB_JAR_LOCATION)
                    .commandLineArgument('gdpr.anonymize.id', GDPR_ANONYMIZE_ID)
                    .commandLineArgument('gdpr.anonymize.nick', GDPR_ANONYMIZE_NICK)
                    .commandLineArgument('fizz.gateway.url', GDPR_FIZZ_GATEWAY_URL)
                    .commandLineArgument('elasticsearch.host', GDPR_ES_HOST)
                    .commandLineArgument('elasticsearch.port', GDPR_ES_PORT)
                    .commandLineArgument('elasticsearch.protocol', GDPR_ES_PROTOCOL)
                    .commandLineArgument('elasticsearch.request.index', GDPR_ES_REQUEST_INDEX)
                    .commandLineArgument('elasticsearch.request.resource', GDPR_ES_REQUEST_RESOURCE)
                    .commandLineArgument('elasticsearch.request.size', GDPR_ES_REQUEST_SIZE)
                    .commandLineArgument('elasticsearch.message.index', GDPR_ES_TEXT_MESSAGE_INDEX)
                    .commandLineArgument('elasticsearch.reportedmessages.index', GDPR_ES_REPORTED_MESSAGES_INDEX)
                    .commandLineArgument('hbase.zookeeper.quorum', GDPR_HBASE_ZOOKEEPER_QOURUM)
                    .commandLineArgument('hbase.zookeeper.property.clientPort', GDPR_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT)
                    .commandLineArgument('hbase.cluster.distributed', GDPR_HBASE_DISTRIBUTED_CLUSTERED)
                    .commandLineArgument('zookeeper.znode.parent', GDPR_HBASE_ZOOKEEPER_ZNODE_PARENT)
                    .commandLineArgument('chat.hbase.namespace', GDPR_CHAT_HBASE_NAMESPACE)
                    .commandLineArgument('chat.hbase.message.table', GDPR_CHAT_HBASE_MESSAGE_TABLE)
                    .commandLineArgument('chat.hbase.message.cf', GDPR_CHAT_HBASE_MESSAGE_CF)

    
    steps.push(builder.jobClass(GDPR_EXTRACT_REQUESTS_JOB_CLASS).build());
    steps.push(builder.jobClass(GDPR_ANONYMIZE_HBASE_JOB_CLASS).build());
    steps.push(builder.jobClass(GDPR_ANONYMIZE_ES_TEXT_MESSAGES_JOB_CLASS).build());
    steps.push(builder.jobClass(GDPR_ANONYMIZE_ES_REPORTED_MESSAGES_JOB_CLASS).build());
    steps.push(builder.jobClass(GDPR_DELETE_GROUP_JOB_CLASS).build());
    steps.push(builder.jobClass(GDPR_UPDATE_REQUESTS_JOB_CLASS).build());

    const clusterName = 'gdpr-job';
    const hadoopCluster = new Cluster().name(clusterName).applicationSet(ApplicationSet.HADOOP).instanceCount(1).steps(steps);

    hadoopCluster.deploy()
    .then(() => Utils.doSafeCallback(callback, null, 'Cluster deployed successfully.'))
    .catch((err) => Utils.doSafeCallback(callback, err, null));
};
