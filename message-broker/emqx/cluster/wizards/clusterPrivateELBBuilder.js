'use strict';

const Utils = require('./utils');
const AWSUtils = require('./awsUtils');

class Builder {
    constructor(name) {
        this.name = Utils.namePrivateELB(name);
        this.securityGroupName = Utils.namePrivateELBSG(name);
        this.context = {};
    }

    createSecurityGroup() {
        return AWSUtils.createSecurityGroup(
            this.securityGroupName, 
            'Allows internal ec2 to connect to EMQX cluster.'
        )
        .then(groupInfo => {
            this.context.securityGroup = groupInfo;
            return AWSUtils.EC2.authorizeSecurityGroupIngress({
                GroupId: groupInfo.GroupId,
                IpPermissions: [
                    {
                        FromPort: 0,
                        ToPort: 65535,
                        IpProtocol: "tcp",
                        IpRanges: [
                            {
                                CidrIp: '0.0.0.0/0', 
                                Description: "Global Access" 
                            }
                        ]
                    }
                ]
            }).promise()
            .then(() => groupInfo.GroupId);
        });
    }

    createLoadBalancer(groupId) {
        //return AWSUtils.describeSubnetIds()
        return AWSUtils.getSubnets()
        .then(subnetIds => {
            return AWSUtils.ELB.createLoadBalancer({
                LoadBalancerName: this.name,
                Scheme: 'Internal',
                SecurityGroups: [
                    groupId
                ],
                Listeners: [
                    {
                        InstancePort: 8081,
                        InstanceProtocol: "HTTP",
                        LoadBalancerPort: 8080,
                        Protocol: "HTTP"
                    },
                    {
                        InstancePort: 3010,
                        InstanceProtocol: "HTTP",
                        LoadBalancerPort: 3010,
                        Protocol: "HTTP"
                    }
                ],
                Subnets: subnetIds,
                Tags: [
                    {
                        Key: 'Name',
                        Value: this.name
                    }
                ]
            }).promise();
        })
        .then(data => {
            this.context.dns = data.DNSName;
            this.context.name = this.name;

            return AWSUtils.ELB.configureHealthCheck({
                HealthCheck: {
                    HealthyThreshold: 3, 
                    Interval: 30, 
                    Target: "HTTP:8081/status", 
                    Timeout: 10, 
                    UnhealthyThreshold: 3
                }, 
                LoadBalancerName: this.name
            }).promise();
        })
        .then(() => {
            return AWSUtils.ELB.configureHealthCheck({
                HealthCheck: {
                    HealthyThreshold: 3, 
                    Interval: 30, 
                    Target: "HTTP:3010/status", 
                    Timeout: 10, 
                    UnhealthyThreshold: 3
                }, 
                LoadBalancerName: this.name
            }).promise();
        })
        .then(() => {
            return AWSUtils.ELB.modifyLoadBalancerAttributes({
                    LoadBalancerAttributes: {
                    CrossZoneLoadBalancing: {
                        Enabled: true
                    }
                }, 
                LoadBalancerName: this.name
            }).promise();
        });
    }

    build() {
        return this.createSecurityGroup()
        .then(groupId => {
            this.context.securityGroup = {};
            this.context.securityGroup.GroupId = groupId;
            return this.createLoadBalancer(groupId);
        })
        .then(() => this.context);
    }
}

module.exports = Builder;