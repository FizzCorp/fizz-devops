'use strict';

const Inquirer = require('inquirer');
const Utils = require('./utils');
const AWSUtils = require('./awsUtils');
const ClusterBuilder = require('./clusterBuilder');
const RunConfigBuilder = require('./runConfigBuilder');
const Base64 = require('base-64');
const IPCIDR = require('ip-cidr');
const DOMAIN_NAME = {
    'us-east-1': '*.fizz.io',
    'us-west-1': '*.test.fizz.io'
};

const validateCidrIp = input =>  {
    return new IPCIDR(input).isValid(); 
}

class Wizard {
    constructor() {
        this.context = {};
        this.domainName = DOMAIN_NAME[AWSUtils.region]
    }

    buildRunConfig() {
        this.config = new RunConfigBuilder(this.context, true);
        return this.config.prompt(false)
        .then(config => { 
            this.context.runConfig = Base64.encode(config);
            return this.context;
        });
    }

    requiredInfoPrompt(sslCertificates) {
        return Inquirer.prompt([
            {
                name: 'SSL_CERTIFICATE_ARN',
                message: 'Please select ssl certificate arn:',
                type: 'list',
                choices: sslCertificates
            },
            {
                name: 'FIZZ_OFFICE_CIDR_IP',
                message: 'Please specify office CidrIp:',
                type: 'input',
                default: '116.90.118.250/32',
                validate: input => validateCidrIp(input)
            },
            {
                name: 'FIZZ_OFFICE_BACKUP_CIDR_IP',
                message: 'Please specify office backup CidrIp:',
                type: 'list',
                default: '43.251.254.7/32',
                choices: ['43.251.254.7/32', '0.0.0.0/0']
            }
        ])
        .then(answers => {
            this.context.asg = {};
            this.context.asg.node = {}
            this.context.asg.name = Utils.nameAutoScalingGroup(this.context.name);
            this.context.asg.node.name = this.context.asg.name + '-node';
            this.context.sslCertificatesARN = answers.SSL_CERTIFICATE_ARN;
            this.context.allowedCIDRIPs = [];
            this.context.allowedCIDRIPs.push(answers.FIZZ_OFFICE_CIDR_IP);
            this.context.allowedCIDRIPs.push(answers.FIZZ_OFFICE_BACKUP_CIDR_IP);
            
            return this.context;
        });
    }

    prompt() {
        return this.buildRunConfig()
        .then(() => {
            return AWSUtils.listSSLCertificates(this.domainName)
        })
        .then(sslCertificates => {
            return this.requiredInfoPrompt(sslCertificates);
        })
        .then(context => {
            return new ClusterBuilder(context).build();
        });
    }
}

module.exports = Wizard;
