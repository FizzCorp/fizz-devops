'use strict';

const Inquirer = require('inquirer');
const FS = require('fs');
const Utils = require('./utils');
const AWSUtils = require('./awsUtils');
const PasswordValidator = require('password-validator');
const uuid = require('uuid/v4');

const PASS_SCHEMA = new PasswordValidator()
.is().min(8)
.is().max(40)
.has().not().spaces();

const isValidNumber = (value, lowerBound, upperBound) => {
    const number = parseInt(value);
    return !isNaN(number) && number > lowerBound && number <= upperBound;
}

const validateHyphenCase = input =>  {
    return new RegExp('[a-z0-9-]*', 'g').test(input);
}

class Wizard {
    constructor(context, autoGenErlangCookie) {
        this.context = context;
        this.autoGenErlangCookie = autoGenErlangCookie;
    }

    questions(keys) {
        let questions = [
            {
                name: 'NAME',
                message: 'Please specify a name for the cluster:',
                type: 'input',
                default: 'emqx-cluster',
                validate: input => validateHyphenCase(input)
            },
            {
                name: 'INSTANCE_TYPE',
                message: 'Please specify instance type:',
                type: 'list',
                choices: [
                    't2.micro',
                    't3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge',
                    'm5.large', 'm5.xlarge', 'm5.24xlarge',
                    'c5.large', 'c5.xlarge', 'c5.2xlarge', 'c5.4xlarge', 'c5.16xlarge', 'c5.24xlarge',
                    'r5.large', 'r5.xlarge', 'r5.2xlarge', 'r5.4xlarge', 'r5.16xlarge', 'r5.24xlarge'
                ],
                default: 'c5.large',
                validate: input => {
                    const tokens = input.split('.');
                    return tokens.length == 2;
                }
            },
            {
                name: 'CLUSTER_REGION_AMI',
                message: 'Please specify emqx cluster region AMI:',
                type: 'input'
            },
            {
                name: 'SESSION_TTL',
                message: 'Please specify client session TTL in min (max 60):',
                type: 'input',
                default: 5,
                validate: input => isValidNumber(input, 0, 60)
            },
            {
                name: 'AUTH_CACHE_TTL',
                message: 'Please specify authorization cache TTL in min:',
                type: 'input',
                default: 5,
                validate: input => isValidNumber(input, 0, 900000)
            },
            {
                name: 'KEY_NAME',
                message: 'Please select a key name:',
                type: 'list',
                choices: keys
            },
            {
                name: 'DISK_SIZE',
                message: 'Please specify disk size:',
                type: 'list',
                choices: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
                default: '40'
            },
            {
                name: 'FIZZ_EMQX_CHAT_IMAGE_URL',
                message: 'Please specify fizz emqx chat docker image url:',
                type: 'input',
                default: 'adminfizz/fizz-emqx-chat:latest'
            },
            {
                name: 'METRICS_IMAGE_URL',
                message: 'Please specify emqx metrics docker image url:',
                type: 'input',
                default: 'adminfizz/emqx-node-metrics:latest'
            },
            {
                name: 'HBASE_CLIENT_QUORUM',
                message: 'Please specify hbase client quorum:',
                type: 'input',
                default: 'hbase.fizz-internal'
            },
            {
                name: 'REDIS_HOST',
                message: 'Please specify redis host:',
                type: 'input',
                default: 'redis.fizz-internal'
            }
        ];

        const elrangCookie = {
            name: 'ERLANG_COOKIE',
            message: 'Please enter the erlang cookie:',
            type: 'input',
            validate: input => {
                return input.length > 0;
            }
        };

        if (this.autoGenErlangCookie) {
            elrangCookie.default = Utils.replaceAll(uuid(), '-', '');
        }

        questions.push(elrangCookie);

        return questions;
    }

    requiredInfoPrompt() {
        return AWSUtils.listKeyPairs()
        .then(keys => {
            return Inquirer.prompt(this.questions(keys));
        })
        .then(answers => {
            this.context.name = answers.NAME;
            this.context.securityGroupName = Utils.nameSecurityGroup(this.context.name);
            this.context.roleName = Utils.nameRole(this.context.name);
            this.context.policyName = Utils.namePolicy(this.context.name);
            this.context.runConfigName = Utils.nameRunConfig(this.context.name)

            this.context.sessionTTL = answers.SESSION_TTL;
            this.context.authCacheTTL = answers.AUTH_CACHE_TTL;
            this.context.instanceType = answers.INSTANCE_TYPE;
            this.context.clusterRegionAmi = answers.CLUSTER_REGION_AMI;
            this.context.keyName = answers.KEY_NAME;
            this.context.diskSize = parseInt(answers.DISK_SIZE);
            this.context.elrangCookie = answers.ERLANG_COOKIE;
            this.context.fizzEmqxChatImageUrl = answers.FIZZ_EMQX_CHAT_IMAGE_URL;
            this.context.metricsImageUrl = answers.METRICS_IMAGE_URL;
            this.context.hbaseClientQuorum = answers.HBASE_CLIENT_QUORUM;
            this.context.redisHost = answers.REDIS_HOST;
        });
    }

    prepareRunConfig() {
        return new Promise((resolve, reject) => {
            FS.readFile('./wizards/EMQXNodeConfig.yaml', (err, buffer) => {
                if (err) {
                    reject(err);
                }
                else {
                    let config = Utils.replaceAll(buffer.toString(), '%ERLANG_COOKIE%', this.context.elrangCookie);
                    config = Utils.replaceAll(config, '%SESSION_TTL%', this.context.sessionTTL);
                    config = Utils.replaceAll(config, '%AUTH_CACHE_TTL%', this.context.authCacheTTL);
                    config = Utils.replaceAll(config, '%AWS_REGION%', AWSUtils.region);
                    config = Utils.replaceAll(config, '%FIZZ_EMQX_CHAT_IMAGE_URL%', this.context.fizzEmqxChatImageUrl);
                    config = Utils.replaceAll(config, '%METRICS_IMAGE_URL%', this.context.metricsImageUrl);
                    config = Utils.replaceAll(config, '%HBASE_CLIENT_QUORUM%', this.context.hbaseClientQuorum);
                    config = Utils.replaceAll(config, '%REDIS_HOST%', this.context.redisHost);
                    resolve(config);
                }
            });
        });
    }

    exportToFile(config) {
        return new Promise((resolve, reject) => {
            FS.writeFile('./' + this.context.runConfigName + '.yaml', config, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    prompt(exportToFile) {
        return this.requiredInfoPrompt(exportToFile)
        .then(() => this.prepareRunConfig())
        .then(config => {
            let exported;

            if (exportToFile) {
                exported = this.exportToFile(config);
            }
            else {
                exported = Promise.resolve();
            }

            return exported.then(() => config);
        });
    }
}

module.exports = Wizard;