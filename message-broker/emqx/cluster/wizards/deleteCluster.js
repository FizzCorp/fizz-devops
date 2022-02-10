'use strict';

const Inquirer = require('inquirer');
const async = require('async');
const Utils = require('./utils');
const AWSUtils = require('./awsUtils');

class Wizard {
    constructor() {
        this.context = {};
    }

    requiredInfoPrompt() {
        return Inquirer.prompt([
            {
                name: 'NAME',
                message: 'Please specify a name for the cluster:',
                type: 'input',
                validate: input => {
                    return input.length > 0;
                }
            }
        ])
        .then(answers => {
            this.context.name = answers.NAME;
            return this.context;
        });
    }

    deleteAutoScalingGroup() {
        console.log('deleting auto scaling group');
        return AWSUtils.AutoScaling.deleteAutoScalingGroup({
            AutoScalingGroupName: Utils.nameAutoScalingGroup(this.context.name),
            ForceDelete: true}).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    listConfigs() {
        return AWSUtils.listLaunchConfigurations(Utils.prefixRunConfig(this.context.name));
    }

    deleteConfigs(configs) {
        const promises = [];
        console.log('config length: ' + configs.length);
        configs.forEach(config => {
            const promise = AWSUtils.AutoScaling.deleteLaunchConfiguration({
                LaunchConfigurationName: config})
                .promise()
            promises.push(promise);
        });
        return Promise.all(promises);
    }

    deleteLaunchConfigurations() {
        console.log('deleting launch configs');
        return this.listConfigs()
        .then(configs => this.deleteConfigs(configs))
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteLoadBalancer(name) {
        return AWSUtils.ELB.deleteLoadBalancer({
            LoadBalancerName: name}).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteLoadBalancerV2(name) {
        return AWSUtils.ELBv2.describeLoadBalancers({
            Names: [name]
        }).promise()
        .then((data) => {
            AWSUtils.ELBv2.deleteLoadBalancer({
                LoadBalancerArn: data.LoadBalancers[0].LoadBalancerArn}).promise()
            .catch(err => {
                console.log(err.message);
                return this.context;
            });
        })
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteLoadBalancers() {
        console.log('deleting load balancers');
        //return this.deleteLoadBalancer(Utils.namePublicELB(this.context.name));
        return this.deleteLoadBalancer(Utils.namePrivateELB(this.context.name))
        .then(() => this.deleteLoadBalancerV2(Utils.namePublicELB(this.context.name)));
    }

    deleteTargetGroup(name) {
        return AWSUtils.ELBv2.describeTargetGroups({
            Names: [name]
        }).promise()
        .then((data) => {
            AWSUtils.ELBv2.deleteTargetGroup({
                TargetGroupArn: data.TargetGroups[0].TargetGroupArn}).promise()
            .catch(err => {
                console.log(err.message);
                return this.context;
            });
        })
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteTargetGroups() {
        console.log('deleting target groups');
        return this.deleteTargetGroup(Utils.wsTGName(this.context.name))
        .then(() => this.deleteTargetGroup(Utils.mqttTGName(this.context.name)));
    }

    deleteSecurityGroup(name) {
        return new Promise((resolve, reject) => {
            async.doWhilst(
                onNext => {
                    //AWSUtils.EC2.deleteSecurityGroup({GroupName: name}).promise()
                    AWSUtils.EC2.deleteSecurityGroup({GroupId: name}).promise()
                    .then(() => {
                        onNext(null, null);
                    })
                    .catch(err => {
                        onNext(null, err.code);
                    })
                },
                (code, doNext) => {
                    if (code === 'DependencyViolation') {
                        console.log('retry after 5 sec.');
                        setTimeout(() => doNext(null, true), 5000);
                    }
                    else {
                        doNext(null, false);
                    }
                },
                error => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                }
            );
        })
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteSecurityGroups() {
        console.log('deleting security groups');
        return AWSUtils.findSecurityGroup(Utils.nameSecurityGroup(this.context.name))
        .then((data) => this.deleteSecurityGroup(data))
        .then(() => AWSUtils.findSecurityGroup(Utils.namePublicELBSG(this.context.name)))
        .then((data) => this.deleteSecurityGroup(data))
        .then(() => AWSUtils.findSecurityGroup(Utils.namePrivateELBSG(this.context.name)))
        .then((data) => this.deleteSecurityGroup(data))

        // return this.deleteSecurityGroup(Utils.nameSecurityGroup(this.context.name))
        // .then(() => this.deleteSecurityGroup(Utils.namePublicELBSG(this.context.name)))
        //.then(() => this.deleteSecurityGroup(Utils.namePrivateELBSG(this.context.name)));)
    }

    removeRoleFromInstanceProfile() {
        console.log('removing instance profile role');
        return AWSUtils.IAM.removeRoleFromInstanceProfile({
            InstanceProfileName: Utils.nameRole(this.context.name),
            RoleName: Utils.nameRole(this.context.name)
        }).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteInstanceProfile() {
        console.log('deleting instance profile');
        return AWSUtils.IAM.deleteInstanceProfile({
            InstanceProfileName: Utils.nameRole(this.context.name)
        }).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    detachRolePolicy() {
        console.log('detaching policy from iam role');
        return AWSUtils.detachRolePolicy(Utils.nameRole(this.context.name), Utils.arnPolicy(Utils.namePolicy(this.context.name)))
        .then(() => AWSUtils.detachRolePolicy(Utils.nameRole(this.context.name), 'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly'))
        .then(() => AWSUtils.detachRolePolicy(Utils.nameRole(this.context.name), 'arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM'))
        .then(() => AWSUtils.detachRolePolicy(Utils.nameRole(this.context.name), 'arn:aws:iam::aws:policy/AmazonSSMFullAccess'))
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteRole() {
        console.log('deleting iam role');
        return AWSUtils.IAM.deleteRole({
            RoleName: Utils.nameRole(this.context.name)
        }).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deletePolicy() {
        console.log('deleting iam policy');
        return AWSUtils.IAM.deletePolicy({
            PolicyArn: Utils.arnPolicy(Utils.namePolicy(this.context.name))
        }).promise()
        .catch(err => {
            console.log(err.message);
            return this.context;
        });
    }

    deleteCluster() {
        return this.deleteAutoScalingGroup()
        .then(() => this.deleteLaunchConfigurations())
        .then(() => this.deleteLoadBalancers())
        .then(() => this.deleteTargetGroups())
        .then(() => this.deleteSecurityGroups())
        .then(() => this.removeRoleFromInstanceProfile())
        .then(() => this.deleteInstanceProfile())
        .then(() => this.detachRolePolicy())
        .then(() => this.deleteRole())
        .then(() => this.deletePolicy());
    }

    silent(name) {
        this.context.name = name;
        return this.deleteCluster();
    }

    prompt() {
        return this.requiredInfoPrompt()
        .then(() => this.deleteCluster());
    }
}

module.exports = Wizard;
