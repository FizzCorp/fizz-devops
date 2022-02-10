'use strict';

const SparkRunnerStepBuilder = require('../../infra/sparkRunnerStepBuilder');
const assert = require('assert');

describe ('while trying to create spark runner step', function () {
    const JOB_CLASS = "io.fizz.analytics.ExportHiveMetricsToTSDBApp";
    const JAR_LOCATION = "s3://com.fizz.prod.analytics/hiveToOpenTSDB-1.0-SNAPSHOT.jar";
    const TSDB_HOST = '64.124.56.98';
    const TSDB_PORT = 4242;
    const SPARK_MASTER = "yarn";
    const USE_SAMPLE_DATA = false;
    const DATA_ROOT = "hdfs:///com.fizz.prod.analytics/data/prod/metrics";

    const TSDB_HOST_OPT = "-Dhive2tsdb.tsdb.host='" + TSDB_HOST + "'";
    const TSDB_PORT_OPT = "-Dhive2tsdb.tsdb.port='" + TSDB_PORT + "'";
    const JAVA_DRIVER_OPTS = 'spark.driver.extraJavaOptions=' + TSDB_HOST_OPT + ' ' + TSDB_PORT_OPT;
    const JAVA_EXECUTOR_OPTS = 'spark.executor.extraJavaOptions=' + TSDB_HOST_OPT + ' ' + TSDB_PORT_OPT;

    it ('should create spark runner step', function () {
        const RUNNER_JAR = 'spark-submit';
        const DEPLOY_MODE_OPT_KEY = '--deploy-mode';
        const DEPLOY_MODE_OPT_VALUE = 'cluster';
        const JAVA_OPTIONS_CONF_KEY = '--conf';
        const JAVA_MAIN_CLASS_KEY = '--class';

        const step = new SparkRunnerStepBuilder()
                        .jobClass(JOB_CLASS)
                        .jobJAR(JAR_LOCATION)
                        .driverExtraJavaOption(TSDB_HOST_OPT)
                        .driverExtraJavaOption(TSDB_PORT_OPT)
                        .executorExtraJavaOption(TSDB_HOST_OPT)
                        .executorExtraJavaOption(TSDB_PORT_OPT)
                        .build();

        const args = step.HadoopJarStep.Args;

        assert (step.ActionOnFailure === 'TERMINATE_JOB_FLOW');
        assert (step.HadoopJarStep.Jar === 'command-runner.jar');
        assert (args[0] === RUNNER_JAR);
        assert (args[1] === DEPLOY_MODE_OPT_KEY);
        assert (args[2] === DEPLOY_MODE_OPT_VALUE);
        assert (args[3] === JAVA_OPTIONS_CONF_KEY);
        assert (args[4] === JAVA_DRIVER_OPTS);
        assert (args[5] === JAVA_OPTIONS_CONF_KEY);
        assert (args[6] === JAVA_EXECUTOR_OPTS);
        assert (args[7] === JAVA_MAIN_CLASS_KEY);
        assert (args[8] === JOB_CLASS);
        assert (args[9] === JAR_LOCATION);
    });

    it ('should not create step if job class is missing', function () {
        const step = new SparkRunnerStepBuilder()
                        .jobJAR(JAR_LOCATION)
                        .driverExtraJavaOption(TSDB_HOST_OPT)
                        .driverExtraJavaOption(TSDB_PORT_OPT)
                        .executorExtraJavaOption(TSDB_HOST_OPT)
                        .executorExtraJavaOption(TSDB_PORT_OPT)
                        .build();

        assert (step === null);
    });

    it ('should not create step if jar location is missing', function () {
        const step = new SparkRunnerStepBuilder()
                        .jobJAR(JAR_LOCATION)
                        .driverExtraJavaOption(TSDB_HOST_OPT)
                        .driverExtraJavaOption(TSDB_PORT_OPT)
                        .executorExtraJavaOption(TSDB_HOST_OPT)
                        .executorExtraJavaOption(TSDB_PORT_OPT)
                        .build();

        assert (step === null);
    });

    it ('should create step even if driver options are missing', function () {
        const step = new SparkRunnerStepBuilder()
                        .jobClass(JOB_CLASS)
                        .jobJAR(JAR_LOCATION)
                        .executorExtraJavaOption(TSDB_HOST_OPT)
                        .executorExtraJavaOption(TSDB_PORT_OPT)
                        .build();
        assert (step !== null);
    });

    it ('should create step even if driver options are missing', function () {
        const step = new SparkRunnerStepBuilder()
                        .jobClass(JOB_CLASS)
                        .jobJAR(JAR_LOCATION)
                        .driverExtraJavaOption(TSDB_HOST_OPT)
                        .driverExtraJavaOption(TSDB_PORT_OPT)
                        .build();
        assert (step !== null);
    });
});