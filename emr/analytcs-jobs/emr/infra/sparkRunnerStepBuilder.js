'use strict';

class StepBuilder {
    jobClass(jobClass) {
        this.class_ = jobClass;
        return this;
    }

    jobJAR(location) {
        this.jarLocation_ = location;
        return this;
    }

    driverExtraJavaOption(option) {
        if (option) {
            if (!this.driverExtraJavaOpts_) {
                this.driverExtraJavaOpts_ = [];
            }
            this.driverExtraJavaOpts_.push(option);
        }
        return this;
    }

    executorExtraJavaOption(option) {
        if (option) {
            if (!this.executorExtraJavaOpts_) {
                this.executorExtraJavaOpts_ = [];
            }   
            this.executorExtraJavaOpts_.push(option);
        }
        return this;
    }

    driverExtraJavaOptions(options) {
        this.driverExtraJavaOpts_ = options;
    }

    executorExtraJavaOptions(options) {
        this.executorExtraJavaOpts_ = options;
    }

    build() {
        if (!this.class_) {
            return null;
        }

        if (!this.jarLocation_) {
            return null;
        }

        const args = [
            'spark-submit',
            '--deploy-mode',
            'cluster',
            '--driver-memory',
            '4G'
        ];

        let driverJavaOpts = '';
        let executorJavaOpts = '';

        if (this.driverExtraJavaOpts_) {
            for (let oi = 0; oi < this.driverExtraJavaOpts_.length; oi++) {
                let prefix = oi > 0 ? ' ' : '';
                driverJavaOpts += prefix + this.driverExtraJavaOpts_[oi];
            }
            args.push('--conf');
            args.push('spark.driver.extraJavaOptions=' + driverJavaOpts);
        }
        if (this.executorExtraJavaOpts_) {
            for (let oi = 0; oi < this.executorExtraJavaOpts_.length; oi++) {
                let prefix = oi > 0 ? ' ' : '';
                executorJavaOpts += prefix + this.executorExtraJavaOpts_[oi];
            }

            args.push('--conf');
            args.push('spark.executor.extraJavaOptions=' + executorJavaOpts);
        }

        args.push('--class');
        args.push(this.class_);
        args.push(this.jarLocation_);

        const step = {
            HadoopJarStep: {
                Jar: 'command-runner.jar',
                Args: args
            },
            Name: 'SparkSubmit step',
            ActionOnFailure: 'TERMINATE_JOB_FLOW'
        };

        return step;
    }
}

module.exports = StepBuilder;
