'use strict';

const DistCpStepBuilder = require('../../infra/distcpStepBuilder');
const assert = require('assert');

describe('while trying to create a distcp step', function () {
    const s3DistCp = "s3-dist-cp";
    const s3Endpoint = "--s3Endpoint=s3.amazonaws.com";
    const src = "s3n://io.fizz.analytics/test";
    const dest = "hdfs:///io.fizz.analytics/test";

    it ('should create distCp step', function () {
        const step = new DistCpStepBuilder ()
                        .source (src)
                        .dest (dest)
                        .build ();

        assert (step.ActionOnFailure === "TERMINATE_JOB_FLOW");
        assert (step.HadoopJarStep.Jar === "command-runner.jar");
        assert (step.HadoopJarStep.Args[0] === s3DistCp);
        assert (step.HadoopJarStep.Args[1] === s3Endpoint);
        assert (step.HadoopJarStep.Args[2] === "--src=" + src);
        assert (step.HadoopJarStep.Args[3] === "--dest=" + dest);
    });

    it ('should fail if no source is specified', function () {
        const step = new DistCpStepBuilder().dest(dest).build();
        assert (step === null);
    });

    it ('should fail if no dest is specified', function () {
        const step = new DistCpStepBuilder().source(src).build();
        assert (step === null);
    });
});