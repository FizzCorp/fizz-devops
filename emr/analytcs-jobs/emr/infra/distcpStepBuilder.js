'use strict';

class DistCpStepBuilder {
    source(src) {
        this.src_ = src;
        return this;
    }

    dest(dest) {
        this.dest_ = dest;
        return this;
    }

    build() {
        if (!this.src_) {
            return null;
        }
        if (!this.dest_) {
            return null;
        }

        const step = {
            HadoopJarStep: {
                Jar: 'command-runner.jar',
                Args: [
                    's3-dist-cp',
                    '--s3Endpoint=s3.amazonaws.com',
                    '--src=' + this.src_,
                    '--dest=' + this.dest_
                ]
            },
            Name: 'S3DistCp step',
            ActionOnFailure: 'TERMINATE_JOB_FLOW'
        };

        return step;
    }
}

module.exports = DistCpStepBuilder;
