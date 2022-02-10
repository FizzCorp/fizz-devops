'use strict';

const SparkRunnerStepBuilder = require('./infra/sparkRunnerStepBuilder');
const ApplicationSet = require('./infra/emrCluster').ApplicationSet;
const Cluster = require('./infra/emrCluster').Cluster;
const Utils = require('./utils');

const ANALYTICS_SPARK_JOB_JAR_LOCATION = process.env.ANALYTICS_SPARK_JOB_JAR_LOCATION || 'com.fizz.prod.analytics/dev';
const ANALYTICS_SPARK_JOB_TSDB_HOST = process.env.ANALYTICS_SPARK_JOB_TSDB_HOST;
const ANALYTICS_SPARK_JOB_TSDB_PORT = process.env.ANALYTICS_SPARK_JOB_TSDB_PORT;
const ANALYTICS_SPARK_JOB_TSDB_PUT_THREASHOLD = process.env.ANALYTICS_SPARK_JOB_TSDB_PUT_THREASHOLD || '50';
const ANALYTICS_SPARK_JOB_ES_HOST = process.env.ANALYTICS_SPARK_JOB_ES_HOST;
const ANALYTICS_SPARK_JOB_ES_PORT = process.env.ANALYTICS_SPARK_JOB_ES_PORT;
const ANALYTICS_SPARK_JOB_ES_PROTOCOL = process.env.ANALYTICS_SPARK_JOB_ES_PROTOCOL;
const ANALYTICS_SPARK_JOB_KAFKA_SERVERS = process.env.GATEWAY_KAFKA_SERVERS;
const ANALYTICS_SPARK_JOB_KAFKA_TOPIC = process.env.GATEWAY_KAFKA_EVENT_STREAM_TOPIC;
const ANALYTICS_SPARK_JOB_MASTER = process.env.ANALYTICS_SPARK_JOB_MASTER;
const ANALYTICS_SPARK_JOB_HIVE_TABLE_ROOT = process.env.ANALYTICS_SPARK_JOB_HIVE_TABLE_ROOT;

const ANALYTICS_AWS_S3_ACCESS_KEY_ID = process.env.ANALYTICS_AWS_S3_ACCESS_KEY_ID || '';
const ANALYTICS_AWS_S3_SECRET_ACCESS_KEY = process.env.ANALYTICS_AWS_S3_SECRET_ACCESS_KEY || '';

const ANALYTICS_HBASE_ZOOKEEPER_QOURUM = process.env.ANALYTICS_HBASE_ZOOKEEPER_QOURUM || ''
const ANALYTICS_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT = process.env.ANALYTICS_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT || ''
const ANALYTICS_HBASE_DISTRIBUTED_CLUSTERED = process.env.ANALYTICS_HBASE_DISTRIBUTED_CLUSTERED || 'true'
const ANALYTICS_HBASE_ZOOKEEPER_ZNODE_PARENT = process.env.ANALYTICS_HBASE_ZOOKEEPER_ZNODE_PARENT || '/hbase-unsecure'

const ANALYTICS_JOB_CLASS_EVENTS_ETL = process.env.ANALYTICS_JOB_CLASS_EVENTS_ETL || 'io.fizz.analytics.jobs.eventsETL.Executor';
const ANALYTICS_JOB_CLASS_EVENT_STREAMING = process.env.ANALYTICS_JOB_CLASS_EVENT_STREAMING || 'io.fizz.analytics.jobs.streamProcessing.Executor';
const ANALYTICS_JOB_CLASS_PROFILE_BUILDUP = process.env.ANALYTICS_JOB_CLASS_PROFILE_BUILDUP || 'io.fizz.analytics.jobs.profileBuildup.Executor';
const ANALYTICS_JOB_CLASS_KEYWORD_ANALYSIS = process.env.ANALYTICS_JOB_CLASS_KEYWORD_ANALYSIS || 'io.fizz.analytics.jobs.keywordAnalysis.Executor';
const ANALYTICS_JOB_CLASS_TEXT_ANALYSIS = process.env.ANALYTICS_JOB_CLASS_TEXT_ANALYSIS || 'io.fizz.analytics.jobs.textAnalysis.Executor';
const ANALYTICS_JOB_CLASS_HIVE_2_HBASE = process.env.ANALYTICS_JOB_CLASS_HIVE_2_HBASE || 'io.fizz.analytics.jobs.hive2hbase.Executor';
const ANALYTICS_JOB_CLASS_HIVE_2_ES = process.env.ANALYTICS_JOB_CLASS_HIVE_2_ES || 'io.fizz.analytics.jobs.hive2ES.Executor';
const ANALYTICS_JOB_CLASS_METRICS_ROLLUP = process.env.ANALYTICS_JOB_CLASS_METRICS_ROLLUP || 'io.fizz.analytics.jobs.metricsRollup.Executor';
const ANALYTICS_JOB_CLASS_METRICS_ROLLUP_MERGE = process.env.ANALYTICS_JOB_CLASS_METRICS_ROLLUP_MERGE || 'io.fizz.analytics.jobs.metricsRollupMerge.Executor';
const ANALYTICS_JOB_CLASS_TSDB_EXPORT = process.env.ANALYTICS_JOB_CLASS_TSDB_EXPORT || 'io.fizz.analytics.jobs.hive2tsdb.Executor';

const TEXT_ANALYSIS_AWS_COMPREHEND_REGION = process.env.TEXT_ANALYSIS_AWS_COMPREHEND_REGION || '';
const TEXT_ANALYSIS_CLIENT = process.env.TEXT_ANALYSIS_CLIENT || '';

const ANALYTICS_JOB_EVENT_PROCCESSING_DAY = process.env.ANALYTICS_JOB_EVENT_PROCCESSING_DAY || '-1';

exports.handler = (lambdaEvent, context, callback) => {
    const steps = [];

    const optTSDBHost = ANALYTICS_SPARK_JOB_TSDB_HOST ? '-Dhive2tsdb.tsdb.host=\'' + ANALYTICS_SPARK_JOB_TSDB_HOST + '\'' : null;
    const optTSDBPort = ANALYTICS_SPARK_JOB_TSDB_PORT ? '-Dhive2tsdb.tsdb.port=\'' + ANALYTICS_SPARK_JOB_TSDB_PORT + '\'' : null;
    const optTSDBPutThreashold = '-Dtsdb.put.threshold=\'' + ANALYTICS_SPARK_JOB_TSDB_PUT_THREASHOLD + '\'';
    const optESHost = ANALYTICS_SPARK_JOB_ES_HOST ? '-Delasticsearch.host=\'' + ANALYTICS_SPARK_JOB_ES_HOST + '\'' : null;
    const optESPort = ANALYTICS_SPARK_JOB_ES_PORT ? '-Delasticsearch.port=' + ANALYTICS_SPARK_JOB_ES_PORT : null;
    const optESProtocol = ANALYTICS_SPARK_JOB_ES_PROTOCOL ? '-Delasticsearch.protocol=\'' + ANALYTICS_SPARK_JOB_ES_PROTOCOL + '\'' : null;
    const optKafkaServers = ANALYTICS_SPARK_JOB_KAFKA_SERVERS ? '-Dgateway.kafka.servers=\'' + ANALYTICS_SPARK_JOB_KAFKA_SERVERS + '\'' : null;
    const optKafkaTopic = ANALYTICS_SPARK_JOB_KAFKA_TOPIC ? '-Dgateway.kafka.event.stream.topic=' + ANALYTICS_SPARK_JOB_KAFKA_TOPIC : null;
    const optSparkMaster = ANALYTICS_SPARK_JOB_MASTER ? '-Dhive2tsdb.spark.master=\'' + ANALYTICS_SPARK_JOB_MASTER + '\'' : null;
    const optUseSampleData = '-Dhive2tsdb.hive.useResources=\'false\'';
    const optDataRoot = '-Dhive2tsdb.hive.dataRoot=\'s3n://' + ANALYTICS_SPARK_JOB_HIVE_TABLE_ROOT + '\'';

    const optS3AccessKeyId = '-Daws.s3n.accessKeyId=\'' + ANALYTICS_AWS_S3_ACCESS_KEY_ID + '\'';
    const optS3SecretAccessKey = '-Daws.s3n.secretAccessKey=\'' + ANALYTICS_AWS_S3_SECRET_ACCESS_KEY + '\'';

    const optHbaseZookeeprQouram = '-Dhbase.zookeeper.quorum=\'' + ANALYTICS_HBASE_ZOOKEEPER_QOURUM + '\'';
    const optHbaseZookeeprPropertyClientPort = '-Dhbase.zookeeper.property.clientPort=\'' + ANALYTICS_HBASE_ZOOKEEPER_PROPERTY_CLIENTPORT + '\'';
    const optHbaseIsDistributedCluster = '-Dhbase.cluster.distributed=\'' + ANALYTICS_HBASE_DISTRIBUTED_CLUSTERED + '\'';
    const optHbaseZookeeprZnodeParent = '-Dzookeeper.znode.parent=\'' + ANALYTICS_HBASE_ZOOKEEPER_ZNODE_PARENT + '\'';

    const optAWSComprehendRegion = '-Daws.nlu.comprehend.region=\'' + TEXT_ANALYSIS_AWS_COMPREHEND_REGION + '\'';
    const optTextAnalysisClient = '-Dnlu.text.analysis.client=\'' + TEXT_ANALYSIS_CLIENT + '\'';


    const optJobEventProcessingDay = '-Djob.event.processing.day=\'' + ANALYTICS_JOB_EVENT_PROCCESSING_DAY + '\'';

    const builder = new SparkRunnerStepBuilder()
                    .jobJAR('s3://' + ANALYTICS_SPARK_JOB_JAR_LOCATION)
                    .driverExtraJavaOption(optTSDBHost)
                    .driverExtraJavaOption(optTSDBPort)
                    .driverExtraJavaOption(optTSDBPutThreashold)
                    .driverExtraJavaOption(optESHost)
                    .driverExtraJavaOption(optESPort)
                    .driverExtraJavaOption(optESProtocol)
                    .driverExtraJavaOption(optKafkaServers)
                    .driverExtraJavaOption(optKafkaTopic)
                    .driverExtraJavaOption(optSparkMaster)
                    .driverExtraJavaOption(optUseSampleData)
                    .driverExtraJavaOption(optDataRoot)
                    .driverExtraJavaOption(optS3AccessKeyId)
                    .driverExtraJavaOption(optS3SecretAccessKey)
                    .driverExtraJavaOption(optHbaseZookeeprQouram)
                    .driverExtraJavaOption(optHbaseZookeeprPropertyClientPort)
                    .driverExtraJavaOption(optHbaseIsDistributedCluster)
                    .driverExtraJavaOption(optHbaseZookeeprZnodeParent)
                    .driverExtraJavaOption(optAWSComprehendRegion)
                    .driverExtraJavaOption(optTextAnalysisClient)
                    .driverExtraJavaOption(optJobEventProcessingDay)
                    .executorExtraJavaOption(optTSDBHost)
                    .executorExtraJavaOption(optTSDBPort)
                    .executorExtraJavaOption(optTSDBPutThreashold)
                    .executorExtraJavaOption(optESHost)
                    .executorExtraJavaOption(optESPort)
                    .executorExtraJavaOption(optESProtocol)
                    .executorExtraJavaOption(optKafkaServers)
                    .executorExtraJavaOption(optKafkaTopic)
                    .executorExtraJavaOption(optSparkMaster)
                    .executorExtraJavaOption(optUseSampleData)
                    .executorExtraJavaOption(optDataRoot)
                    .executorExtraJavaOption(optS3AccessKeyId)
                    .executorExtraJavaOption(optS3SecretAccessKey)
                    .executorExtraJavaOption(optHbaseZookeeprQouram)
                    .executorExtraJavaOption(optHbaseZookeeprPropertyClientPort)
                    .executorExtraJavaOption(optHbaseIsDistributedCluster)
                    .executorExtraJavaOption(optHbaseZookeeprZnodeParent)
                    .executorExtraJavaOption(optTextAnalysisClient)
                    .executorExtraJavaOption(optAWSComprehendRegion)
                    .executorExtraJavaOption(optJobEventProcessingDay);

    // step 1: ETL old events
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_EVENTS_ETL).build());

    // step 2: event streaming
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_EVENT_STREAMING).build());

    // step 3: text analysis
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_TEXT_ANALYSIS).build());

    // step 4: profile enrichment
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_PROFILE_BUILDUP).build())

    // step 5: export keywords from chat messages (backwards compatibility)
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_KEYWORD_ANALYSIS).build());

    // step 6: export user profiles to hbase
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_HIVE_2_HBASE).build());

    // step 7: export scored messages to elastic search
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_HIVE_2_ES).build());

    // step 8: metrics rollup
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_METRICS_ROLLUP).build());

    // step 9: metrics rollup merge
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_METRICS_ROLLUP_MERGE).build());

    // step 10: export metrics to tsdb
    steps.push(builder.jobClass(ANALYTICS_JOB_CLASS_TSDB_EXPORT).build());

    const clusterName = 'daily-analysis-batch-job';
    const sparkCluster = new Cluster().name(clusterName).applicationSet(ApplicationSet.SPARK).instanceCount(1).steps(steps);

    sparkCluster.deploy()
    .then(() => Utils.doSafeCallback(callback, null, 'Cluster deployed successfully.'))
    .catch((err) => Utils.doSafeCallback(callback, err, null));
};
