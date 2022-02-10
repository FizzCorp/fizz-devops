'use strict';

const async = require('async');
const Utils = require('./utils');
const AWSUtils = require('./awsUtils');

class Builder {
    constructor(name, sslCertificatesARN) {
        this.name = Utils.namePublicELB(name);
        this.vpcId = AWSUtils.vpcId;
        this.sslCertificatesARN = sslCertificatesARN;
        this.mqttTGName = Utils.mqttTGName(name);
        this.wsTGName = Utils.wsTGName(name);
        this.context = {};
    }
    
    createLoadBalancer() {
        //return AWSUtils.describeSubnetIds()
        return AWSUtils.getSubnets()
        .then(subnetIds => {
            return AWSUtils.ELBv2.createLoadBalancer({
                Type: 'network',
                Name: this.name,
                Subnets: subnetIds,
                Tags: [
                    {
                        Key: 'Name',
                        Value: this.name
                    }
                ]
            }).promise()
        })
        .then(data => {
            this.context.nlbDns = data.LoadBalancers[0].DNSName;
            this.context.nlbArn = data.LoadBalancers[0].LoadBalancerArn;
            return Promise.resolve();
        });
    }

    fetchLoadBalancerIPs() {
        console.log('fetching newly created network interface of public nlb');
        const tokenizeArn = this.context.nlbArn.split('/');
        tokenizeArn.shift();
        const description = 'ELB ' + tokenizeArn.join('/');
        return new Promise((resolve, reject) => {
            async.doWhilst(
                onNext => {
                    return AWSUtils.EC2.describeNetworkInterfaces({
                        Filters: [
                            {
                                Name: 'description',
                                Values: [description]
                            }
                        ]
                    }).promise()
                    .then((data) => {
                        onNext(null, data.NetworkInterfaces);
                    })
                    .catch(err => {
                        onNext(null, null);
                    })
                },
                (networkInterfaces, doNext) => {
                    if (networkInterfaces.length === 0) {
                        console.log('retry after 5 sec.');
                        setTimeout(() => doNext(null, true), 5000);
                    }
                    else {
                        console.log('network interface fetched')
                        this.context.nlbPrivateIPs = [];
                        networkInterfaces.forEach(networkInterface => {
                            this.context.nlbPrivateIPs.push(networkInterface.PrivateIpAddress);
                        });
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
        });
    }

    modifyLoadBalancerAttributes() {
        return AWSUtils.ELBv2.modifyLoadBalancerAttributes({
            LoadBalancerArn: this.context.nlbArn,
            Attributes: [
                {
                  Key: 'load_balancing.cross_zone.enabled',
                  Value: 'true'
                }
            ],
        }).promise();
    }

    createMqttTargetGroup() {
        return AWSUtils.ELBv2.createTargetGroup({
            Name: this.mqttTGName,
            Port: '1883',
            Protocol: 'TCP',
            TargetType: 'instance',
            VpcId: this.vpcId,
            HealthCheckPort: '3010'
        }).promise()
        .then((data) => {
            this.context.mqttTGName = data.TargetGroups[0].TargetGroupName;
            this.context.mqttTGArn = data.TargetGroups[0].TargetGroupArn;
            return Promise.resolve();
        })
        .then(() => {
            return AWSUtils.ELBv2.modifyTargetGroupAttributes({
                Attributes: [ 
                    {
                        Key: 'stickiness.enabled',
                        Value: 'true'
                    },
                ],
                TargetGroupArn: this.context.mqttTGArn
            }).promise();
        });
    }

    createWSTargetGroup() {
        return AWSUtils.ELBv2.createTargetGroup({
            Name: this.wsTGName,
            Port: '8083',
            Protocol: 'TCP',
            TargetType: 'instance',
            VpcId: this.vpcId,
            HealthCheckPort: '3010'
        }).promise()
        .then((data) => {
            this.context.wsTGName = data.TargetGroups[0].TargetGroupName;
            this.context.wsTGArn = data.TargetGroups[0].TargetGroupArn;
            return Promise.resolve();
        })
        .then(() => {
            return AWSUtils.ELBv2.modifyTargetGroupAttributes({
                Attributes: [ 
                    {
                        Key: 'stickiness.enabled',
                        Value: 'true'
                    },
                ],
                TargetGroupArn: this.context.wsTGArn
            }).promise();
        });
    }

    createTargerGroups() {
        return this.createMqttTargetGroup()
        .then(() => this.createWSTargetGroup());
    }

    createListner1883() {
        return AWSUtils.ELBv2.createListener({
            DefaultActions: [{
                TargetGroupArn: this.context.mqttTGArn, 
                Type: "forward"
            }], 
            LoadBalancerArn: this.context.nlbArn, 
            Port: 1883, 
            Protocol: "TCP"
        }).promise();
    }

    createListner8883() {
        return AWSUtils.ELBv2.createListener({
            Certificates: [{
                CertificateArn: this.sslCertificatesARN
            }], 
            DefaultActions: [{
                TargetGroupArn: this.context.mqttTGArn, 
                Type: "forward"
            }], 
            LoadBalancerArn: this.context.nlbArn, 
            Port: 8883, 
            Protocol: "TLS",
            SslPolicy: "ELBSecurityPolicy-2015-05"
        }).promise();
    }

    createListner8083() {
        return AWSUtils.ELBv2.createListener({
            DefaultActions: [{
                TargetGroupArn: this.context.wsTGArn, 
                Type: "forward"
            }], 
            LoadBalancerArn: this.context.nlbArn, 
            Port: 8083, 
            Protocol: "TCP"
        }).promise();
    }

    createListner443() {
        return AWSUtils.ELBv2.createListener({
            Certificates: [{
                CertificateArn: this.sslCertificatesARN
            }], 
            DefaultActions: [{
                TargetGroupArn: this.context.wsTGArn, 
                Type: "forward"
            }], 
            LoadBalancerArn: this.context.nlbArn, 
            Port: 443, 
            Protocol: "TLS",
            SslPolicy: "ELBSecurityPolicy-2015-05"
        }).promise();
    }

    createListners() {
        return this.createListner1883()
        .then(() => this.createListner8883())
        .then(() => this.createListner8083())
        .then(() => this.createListner443())
    }

    build() {
        return this.createLoadBalancer()
        .then(() => this.fetchLoadBalancerIPs())
        .then(() => this.modifyLoadBalancerAttributes())
        .then(() => this.createTargerGroups())
        .then(() => this.createListners())
        .then(() => this.context);
    }
}

module.exports = Builder;