'use strict';

const AWSUtils = require('./awsUtils');
const Utils = require('./utils');

class Builder {
    constructor(roleName, policyName) {
        this.roleName = roleName;
        this.policyName = policyName;
        this.context = {};
    }

    findClusterPolicy() {
        return AWSUtils.IAM.getPolicy({
            PolicyArn: Utils.arnPolicy(this.policyName)
        }).promise()
    }

    createClusterPolicy() {
        const policyDoc = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "autoscaling:DescribeAutoScalingGroups",
                        "autoscaling:DescribeAutoScalingInstances",
                        "ec2:DescribeInstances"
                    ],
                    "Resource": [
                        "*"
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "cloudwatch:PutMetricData",
                        "ec2:DescribeTags"
                    ],
                    "Resource": [
                        "*"
                    ]
                }
            ]
        };

        return AWSUtils.IAM.createPolicy({
            PolicyDocument: JSON.stringify(policyDoc),
            PolicyName: this.policyName
        }).promise();
    }

    findInstanceProfile() {
        return AWSUtils.IAM.getInstanceProfile({
            InstanceProfileName: this.roleName
        }).promise();
    }

    createInstanceProfile() {
        return AWSUtils.IAM.createInstanceProfile({
            InstanceProfileName: this.roleName
        }).promise();
    }

    createClusterRole() {
        const doc = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {
                    "Service": "ec2.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }]
        };

        return AWSUtils.createRole(this.roleName, doc)
        .then(() => this.findClusterPolicy())
        .then(() => this.findInstanceProfile())
        .then(() => AWSUtils.attachRolePolicy(this.roleName, Utils.arnPolicy(this.policyName)))
        .then(() => AWSUtils.attachRolePolicy(this.roleName, 'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly'))
        .then(() => AWSUtils.attachRolePolicy(this.roleName, 'arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM'))
        .then(() => AWSUtils.attachRolePolicy(this.roleName, 'arn:aws:iam::aws:policy/AmazonSSMFullAccess'))
        .then(() => AWSUtils.addRoleToInstanceProfile(this.roleName, this.roleName))
        .then(() => AWSUtils.delayedResponse(10000));
    }

    build() {
        return this.createClusterPolicy()
        .then(data => {
            this.context.policy = data;
            return this.createInstanceProfile();
        })
        .then(() => this.createClusterRole())
        .then(data => {
            this.context.role = data;
            return this.context;
        });
    }
}

module.exports = Builder;