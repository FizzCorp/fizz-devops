'use strict';

const AWS = require('aws-sdk');

const GDPR_EMR_ROLE = process.env.GDPR_EMR_ROLE || 'EMR_DefaultRole';
const GDPR_EC2_ROLE = process.env.GDPR_EC2_ROLE || 'EMR_EC2_DefaultRole';
const GDPR_REGION = process.env.GDPR_AZ || 'us-east-1';
const GDPR_AZ = GDPR_REGION + 'a';
const GDPR_INSTANCE = process.env.GDPR_INSTANCE || 'm3.xlarge';
const GDPR_LOG_URI = process.env.GDPR_LOG_URI || '';
const GDPR_KEY_PAIR_NAME = process.env.GDPR_KEY_PAIR_NAME || 'fizz-server-dev';

const GDPR_EMR_RELEASE = 'emr-5.15.0';

const emr = new AWS.EMR({
    'region': GDPR_REGION
});

const ec2 = new AWS.EC2({
    'region': GDPR_REGION
});

class ApplicationSet {
    static get HADOOP() {
        return [
            {'Name': 'Hadoop'}
        ];
    }
}

class InstanceRoleType {
    static get MASTER() {
        return 'MASTER';
    }
    static get CORE() {
        return 'CORE';
    }
    static get TASK() {
        return 'TASK';
    }
}

class ClusterImpl {
    static buildEBSConfig(volumeInGB) {
        if (volumeInGB) {
            return {
                EbsBlockDeviceConfigs: [{
                    VolumeSpecification: {
                        SizeInGB: volumeInGB,
                        VolumeType: 'gp2'
                    },
                    VolumesPerInstance: 1
                }]
            };
        }
        else {
            return null;
        }
    }

    static buildInstanceGroups_(self) {
        const instanceGroups = [{
            InstanceCount: 1,
            InstanceRole: InstanceRoleType.MASTER,
            InstanceType: self.masterInstanceType_,
            EbsConfiguration: ClusterImpl.buildEBSConfig(self.masterEBSVolumeInGB_),
            Name: 'Master'
         }];

         if (self.slaveInstanceType_) {
             instanceGroups.push({
                InstanceCount: self.slaveInstanceType_ ? 1 : 0,
                InstanceRole: InstanceRoleType.CORE,
                InstanceType: self.slaveInstanceType_,
                EbsConfiguration: ClusterImpl.buildEBSConfig(self.slaveEBSVolumeInGB_),
                Name: 'Core - 2'
            });
         }

        return instanceGroups;
    }

    static validate_(self) {
        if (!self.applications_) {
            return 'No applications specified for installation.';
        }
        if (!self.name_) {
            return 'Name of the cluster not specified.';
        }
        if (!self.steps_) {
            return 'Not steps for execution provided';
        }
        if (self.instanceCount_ < 1) {
            console.warn('Instances count must be set to atleast one instance.');
            self.instanceCount_ = 1;
        }
        if (!self.masterInstanceType_) {
            console.warn('Master instance not specified defaulting to', GDPR_INSTANCE);
            self.masterInstanceType_ = GDPR_INSTANCE;
        }
        /*
        if (!self.slaveInstanceType_) {
            console.warn('Slave instance not specified defaulting to', GDPR_INSTANCE);
            self.slaveInstanceType_ = GDPR_INSTANCE;
        }
        */
        if (!self.availabilityZone_) {
            console.warn('Availability zone not specified defaulting to', GDPR_REGION);
            self.availabilityZone_ = GDPR_REGION;
        }
        if (!self.logURI_) {
            self.logURI_ = GDPR_LOG_URI;
        }

        if (!self.serviceRole_) {
            self.serviceRole_ = GDPR_EMR_ROLE;
        }
        if (!self.jobFlowRole_) {
            self.jobFlowRole_ = GDPR_EC2_ROLE;
        }
        if (!self.keepAlive_) {
            self.keepAlive_ = false;
        }

        return null;
    }

    static fetchDefaultSubnet_(availabilityZone) {
        return new Promise((resolve, reject) => {
            const params = {
                Filters: [{
                    Name: 'availabilityZone',
                    Values: [availabilityZone]
                }]
            };
            ec2.describeSubnets(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    const subnets = data.Subnets;
                    let id = null;
                    for (let si = 0; si < subnets.length; si++) {
                        const subnet = subnets[si];
                        if (subnet.DefaultForAz && subnet.State === 'available') {
                            id = subnet.SubnetId;
                            break;
                        }
                    }
                    if (id) {
                        resolve(id);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }

    static buildClusterParams_(self, subnetId) {
        const params = {
            Instances: {
                Ec2KeyName: GDPR_KEY_PAIR_NAME,
                KeepJobFlowAliveWhenNoSteps: self.keepAlive_,
                InstanceGroups: ClusterImpl.buildInstanceGroups_(self)
            },
            Name: self.name_,
            Applications: self.applications_,
            ReleaseLabel: GDPR_EMR_RELEASE,
            ServiceRole: self.serviceRole_,
            JobFlowRole: self.jobFlowRole_,
            Steps: self.steps_,
            VisibleToAllUsers: true
         };

         if (subnetId) {
             params.Instances.Ec2SubnetId = subnetId;
         }
         else {
             params.Instances.Placement = {AvailabilityZone: GDPR_AZ};
         }

         if (self.logURI_) {
             params.LogUri = self.logURI_;
         }
         if (self.tags_) {
             self.Tags = self.tags_;
         }

         return params;
    }
}

class Cluster {
    constructor() {
    }

    name(name) {
        this.name_ = name;
        return this;
    }

    keepAlive(state) {
        this.keepAlive_ = state;
        return this;
    }

    instanceCount(count) {
        this.instanceCount_ = count;
        return this;
    }

    masterInstanceType(type) {
        this.masterInstanceType_ = type;
        return this;
    }

    masterEBSVolumeInGB(size) {
        this.masterEBSVolumeInGB_ = size;
        return this;
    }

    slaveInstanceType(type) {
        this.slaveInstanceType_ = type;
        return this;
    }

    slaveEBSVolumeInGB(size) {
        this.slaveEBSVolumeInGB_ = size;
        return this;
    }

    availabilityZone(zone) {
        this.availabilityZone_ = zone;
        return this;
    }

    applicationSet(set) {
        this.applications_ = set;
        return this;
    }

    logURI(uri) {
        this.logURI_ = uri;
        return this;
    }

    serviceRole(role) {
        this.serviceRole_ = role;
        return this;
    }

    jobFlowRole(role) {
        this.jobFlowRole_ = role;
        return this;
    }

    steps(steps) {
        this.steps_ = steps;
        return this;
    }

    tag(tag) {
        if (!this.tags_) {
            this.tags_ = [];
        }
        this.tags_.push(tag);
        return this;
    }

    deploy() {
        const self = this;

        const err = ClusterImpl.validate_(this);
        if (err) {
            return Promise.reject(err);
        }

        return ClusterImpl.fetchDefaultSubnet_(GDPR_AZ)
        .then((subnetId) => {
            return new Promise((resolve, reject) => {
                const params = ClusterImpl.buildClusterParams_(self, subnetId);
                emr.runJobFlow(params, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}

module.exports.ApplicationSet = ApplicationSet;
module.exports.Cluster = Cluster;
