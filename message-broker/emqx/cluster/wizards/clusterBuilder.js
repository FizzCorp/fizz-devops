'use strict';

const AWSUtils = require('./awsUtils');
const PublicNLBBuilder = require('./clusterPublicNLBBuilder');
const PrivateELBBuilder = require('./clusterPrivateELBBuilder');
//const PublicELBBuilder = require('./clusterPublicELBBuilder');
const RoleBuilder = require('./clusterRoleBuilder');
const RunConfig = require('./runConfig');

class Builder {
    constructor(context) {
        this.context = context;
        this.nodeAMI = this.context.clusterRegionAmi;
    }

    allowCIDRIPsToIpRanges() {
        const ipRanges = [];
        this.context.allowedCIDRIPs.forEach(CidrIp => {
            ipRanges.push({
                CidrIp: CidrIp, 
                Description: "Custom Allowed IP (Office)" 
            });
        });
        return ipRanges;
    }

    nlbPrivateIPsToIpRanges() {
        const ipRanges = [];
        this.context.publicNLB.nlbPrivateIPs.forEach(ip => {
            ipRanges.push({
                CidrIp: ip + '/32', 
                Description: "NLB Private IP" 
            });
        });
        return ipRanges;
    }

    buildSecurityGroup() {
        console.log('creating Instance Security Group')
        return AWSUtils.createSecurityGroup(
            this.context.name + '-sg', 
            'Security group that allows nodes in a Emqx cluster to communicate with each other.'
        )
        .then(groupInfo => {
            return AWSUtils.EC2.authorizeSecurityGroupIngress({
                GroupId: groupInfo.GroupId,
                IpPermissions: [
                    {
                        FromPort: 0,
                        ToPort: 65535,
                        IpProtocol: "tcp",
                        UserIdGroupPairs: [{
                            GroupId: groupInfo.GroupId, 
                            Description: "Self" 
                        }]
                    },
                    {
                        FromPort: 0,
                        ToPort: 65535,
                        IpProtocol: "tcp",
                        UserIdGroupPairs: [{
                            // GroupId: this.context.publicELB.securityGroup.GroupId,
                            // Description: "Public ELB"
                            GroupId: this.context.privateELB.securityGroup.GroupId,
                            Description: "Private ELB"
                        }]
                    },
                    {
                        FromPort: 0,
                        ToPort: 65535,
                        IpProtocol: "tcp",
                        IpRanges: this.allowCIDRIPsToIpRanges()
                    },
                    {
                        FromPort: 0,
                        ToPort: 65535,
                        IpProtocol: "tcp",
                        IpRanges: this.nlbPrivateIPsToIpRanges()
                    },
                    {
                        FromPort: 1883,
                        ToPort: 1883,
                        IpProtocol: "tcp",
                        IpRanges: [{
                            CidrIp: '0.0.0.0/0', 
                            Description: "Public Port Non Secure MQTT" 
                        }]
                    },
                    {
                        FromPort: 8883,
                        ToPort: 8883,
                        IpProtocol: "tcp",
                        IpRanges: [{
                            CidrIp: '0.0.0.0/0', 
                            Description: "Public Port Secure MQTT" 
                        }]
                    },
                    {
                        FromPort: 8083,
                        ToPort: 8083,
                        IpProtocol: "tcp",
                        IpRanges: [{
                            CidrIp: '0.0.0.0/0', 
                            Description: "Public Port Non Secure WS" 
                        }]
                    }
                ]
            }).promise()
            .then(response => {
                this.context.groupId = groupInfo.GroupId;
                return this.context;
            });
        });
    }

    createELB() {
        console.log('creating ELB')
        // return new PublicNLBBuilder(this.context.name, this.context.sslCertificatesARN).build()
        // .then (context => {
        //     this.context.publicELB = context;
        //     return this.context;
        // })
        return new PublicNLBBuilder(this.context.name, this.context.sslCertificatesARN).build()
        .then (context => {
            this.context.publicNLB = context
            return new PrivateELBBuilder(this.context.name).build()
        })
        .then(context => {
            this.context.privateELB = context
            return this.context;
        });
    }

    buildRole() {
        console.log('creating Role')
        return new RoleBuilder(this.context.roleName, this.context.policyName).build()
        .then(role => {
            this.context.iam = role;
            return this.context;
        });
    }

    findImages() {
        console.log('finding images')
        return AWSUtils.findImage(this.nodeAMI)
        .then(imagesInfo => {
            this.context.imagesInfo = imagesInfo;
            return this.context;
        });
    }

    buildLaunchConfig() {
        console.log('creating launch config')
        return new RunConfig(this.context).publish();
    }

    buildAutoScalingGroup() {
        console.log('creating auto scaling group')
        //return AWSUtils.EC2.describeSubnets({}).promise()
        return AWSUtils.getSubnets()
        .then(data => {
            //const subnets = data.Subnets;
            const subnets = data;
            let subnetIds = '';

            for (let si = 0; si < subnets.length; si++) {
                if (si > 0) {
                    subnetIds = subnetIds + ', ';
                }
                //subnetIds = subnetIds + subnets[si].SubnetId;
                subnetIds = subnetIds + subnets[si];
            }

            AWSUtils.AutoScaling.createAutoScalingGroup({
                AutoScalingGroupName: this.context.asg.name,
                LaunchConfigurationName: this.context.runConfigName,
                MaxSize: 20,
                MinSize: 1,
                DesiredCapacity: 1,
                VPCZoneIdentifier: subnetIds,
                LoadBalancerNames: [
                    this.context.privateELB.name
                    //this.context.publicELB.name
                ],
                TargetGroupARNs: [
                    this.context.publicNLB.mqttTGArn,
                    this.context.publicNLB.wsTGArn,
                ], 
                Tags: [{
                    Key: "Name", 
                    PropagateAtLaunch: true,
                    Value: this.context.asg.node.name
                }]
            }).promise();
        })
    }

    build() {
        return this.createELB()
        .then(() => this.buildRole())
        .then(() => this.buildSecurityGroup())
        .then(() => this.findImages())
        .then(() => this.buildLaunchConfig())
        .then(() => this.buildAutoScalingGroup());
    }
}

module.exports = Builder;
