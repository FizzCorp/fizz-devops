'use strict';
const AWSUtils = require('./awsUtils');
const Base64 = require('base-64');
const RunConfigBuilder = require('./runConfigBuilder');

class Wizard {
    constructor(context) {
        this.context = context ? context : {};
        this.nodeAMI = this.context.clusterRegionAmi;
    }

    publish() {
        const imageInfo = this.context.imagesInfo.Images[0];
        const deviceMapping = imageInfo.BlockDeviceMappings[0];
        return AWSUtils.AutoScaling.createLaunchConfiguration({
            LaunchConfigurationName: this.context.runConfigName,
            AssociatePublicIpAddress: true,
            ImageId: this.nodeAMI,
            BlockDeviceMappings: [
                {
                    DeviceName: deviceMapping.DeviceName,
                    Ebs: {
                        DeleteOnTermination: true,
                        VolumeSize: this.context.diskSize,
                        VolumeType: 'gp2',
                        SnapshotId: deviceMapping.Ebs.SnapshotId
                    }
                }
            ],
            InstanceType: this.context.instanceType,
            InstanceMonitoring: { Enabled: false},
            SecurityGroups: [
                this.context.groupId
            ],
            KeyName: this.context.keyName,
            UserData: this.context.runConfig,
            IamInstanceProfile: this.context.roleName,
            InstanceMonitoring: {
                Enabled: true
            }
        }).promise();
    }

    findImages() {
        return AWSUtils.findImage(this.nodeAMI)
        .then((imagesInfo) => {
            this.context.imagesInfo = imagesInfo;
            return this.context;
        });
    }

    findSecurityGroup() {
        return AWSUtils.findSecurityGroup(this.context.securityGroupName)
        .then(groupId => {
            if (!groupId) {
                throw 'unable to find securty group';
            }
            this.context.groupId = groupId;
            return this.context;
        });
    }

    buildConfig() {
        this.config = new RunConfigBuilder(this.context, false);
        return this.config.prompt(false)
        .then (config => {
            this.context.runConfig = Base64.encode(config);
            return this.context;
        });
    }

    prompt() {
        return this.buildConfig()
        .then(() => this.findSecurityGroup())
        .then(() => this.findImages())
        .then(() => this.publish())
        .then(() => {
            console.log('publised with name: ' + this.context.runConfigName);
            return this.context;
        });
    }
}

module.exports = Wizard;
