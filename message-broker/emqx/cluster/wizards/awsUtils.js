'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const AWS_ACCOUNT_ID = '<<aws-account-id>>';

var REGION;
var VPC_ID;
var AutoScaling;
var EC2;
var IAM;
var ELB;
var ELBv2;
var ACM;
var SUBNETS;

class Utils {
    static init(region) {
        REGION = region;
        AWS.config.update({region: REGION})
        AutoScaling = new AWS.AutoScaling()
        EC2 = new AWS.EC2();
        IAM = new AWS.IAM();
        ELB = new AWS.ELB();
        ELBv2 = new AWS.ELBv2();
        ACM = new AWS.ACM();
    }

    static get AccountId() {
        return AWS_ACCOUNT_ID;
    }

    static get region() {
        return REGION;
    }

    static get vpcId() {
        return VPC_ID;
    }

    static set vpcId(vpcId) {
        VPC_ID = vpcId;
    }
    
    static get EC2() {
        return EC2;
    }

    static get ELB() {
        return ELB;
    }

    static get ELBv2() {
        return ELBv2;
    }

    static get AutoScaling() {
        return AutoScaling;
    }

    static get IAM() {
        return IAM;
    }

    static listVpcIds() {
        return EC2.describeVpcs().promise()
        .then(data => {
            let vpcIds = [];
            data.Vpcs.forEach(function (vpc) {
                vpcIds.push(vpc.VpcId);
            });
            return vpcIds;
        });
    }

    static listKeyPairs() {
        return EC2.describeKeyPairs({}).promise()
        .then(data => {
            let keys = [];
            for (let i = 0; i < data.KeyPairs.length; i++) {
                keys.push(data.KeyPairs[i].KeyName);
            }
            return keys;
        });
    }

    static listSSLCertificates(domain) {
        return ACM.listCertificates({}).promise()
        .then(data => {
            let keys = [];
            data.CertificateSummaryList.forEach(function (certificate) {
                if (certificate.DomainName === domain) {
                    keys.push(certificate.CertificateArn);
                }
            });
            return keys;
        });
    }

    static listLaunchConfigurations(prefix) {
        let configs = [];
        let nextToken;

        return new Promise((resolve, reject) => {
            async.doWhilst(
                onNext => {
                    AutoScaling.describeLaunchConfigurations({NextToken: nextToken}).promise()
                    .then(data => {
                        data.LaunchConfigurations.forEach(function (launchConfiguration) {
                            const name = launchConfiguration.LaunchConfigurationName;
                            if (name.startsWith(prefix)) {
                                configs.push(launchConfiguration.LaunchConfigurationName);
                            }
                        });
    
                        onNext(null, data.NextToken);
                    })
                },
                (token, doNext) => {
                    nextToken = token;
                    doNext(null, token);
                },
                error => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(configs);
                    }
                }
            );
        });
    }

    static findImage(imageId) {
        return EC2.describeImages({
            ImageIds: [
                imageId
            ]
        }).promise();
    }

    static findRole(name) {
        return IAM.getRole({
            RoleName: name
        }).promise();
    }

    static createRole(name, doc) {
        return IAM.createRole({
            RoleName: name,
            AssumeRolePolicyDocument: JSON.stringify(doc)
        }).promise();
    }

    static attachRolePolicy(name, policyArn) {
        return IAM.attachRolePolicy({
            RoleName: name,
            PolicyArn: policyArn
        }).promise();
    }

    static detachRolePolicy(name, policyArn) {
        return IAM.detachRolePolicy({
            RoleName: name,
            PolicyArn: policyArn
        }).promise();
    }

    static addRoleToInstanceProfile(roleName, profileName) {
        return IAM.addRoleToInstanceProfile({
            InstanceProfileName: profileName,
            RoleName: roleName
        }).promise();
    }

    static findSecurityGroup(groupName) {
        return EC2.describeSecurityGroups({}).promise()
        .then(data => {
            const groups = data.SecurityGroups;
            let groupId;

            for (let gi = 0; gi < groups.length; gi++) {
                if (groups[gi].GroupName === groupName) {
                    groupId = groups[gi].GroupId;
                    break;
                }
            }

            return groupId;
        });
    }

    static createSecurityGroup(name, description) {
        return EC2.createSecurityGroup({
            Description: description,
            GroupName: name,
            VpcId: this.vpcId
        }).promise();
    }

    static delayedResponse(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    }

    static describeSubnetIds() {
        return EC2.describeSubnets({
            Filters: [{
               Name: "vpc-id", 
               Values: [
                  this.vpcId
               ]
            }]
        }).promise()
        .then(data => {
            const subnets = data.Subnets;
            let subnetIds = [];

            for (let si = 0; si < subnets.length; si++) {
                subnetIds.push(subnets[si].SubnetId);
            }

            return subnetIds;
        });
    }

    static getSubnets() {
        return new Promise((resolve, reject) => {
            resolve(SUBNETS)
        });
    }

    static get subnets() {
        return SUBNETS;
    }

    static set subnets(subnetids) {
        SUBNETS = subnetids;
    }
}

module.exports = Utils;