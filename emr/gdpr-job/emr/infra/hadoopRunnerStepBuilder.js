'use strict';

class StepBuilder {
    jobJAR(location) {
        this.jarLocation_ = location;
        return this;
    }

    jobClass(jobClass) {
        this.class_ = jobClass;
        return this;
    }

    commandLineArgument(key, value) {
        if (!this.args_) {
            this.args_ = [];
        }

        if (key && value) {
            this.args_.push('-D' + key + '=' + value)
        }

        return this;
    }

    build() {
        if (!this.jarLocation_) {
            return null;
        }

        if (!this.class_) {
            return null;
        }

        const step = {
            HadoopJarStep: {
                Jar: this.jarLocation_,
                Args: this.args_, 
                MainClass: this.class_
            },
            Name: 'gdpr-job',
            ActionOnFailure: 'TERMINATE_JOB_FLOW',
        };

        return step;
    }
}

module.exports = StepBuilder;
