'use strict';

const Inquirer = require('inquirer');
const AWSUtils = require('./wizards/awsUtils');
const MainMenu = require('./wizards/mainMenu');

const commandWizard = () => {
    return Inquirer.prompt([
        {
            name: 'REGION',
            message: 'Please select a region:',
            type: 'list',
            choices: [
                'us-east-1',
                'us-west-1'
            ],
            default: 'us-west-1'
        }
    ])
    .then(answers => {
        AWSUtils.init(answers.REGION);
        return AWSUtils.listVpcIds();
    })
    .then((vpcIds) => {
        return Inquirer.prompt([
            {
                name: 'VPC_ID',
                message: 'Please choose a vpc id:',
                type: 'list',
                choices: vpcIds,
                default: vpcIds[0]
            }
        ])
    })
    .then(answers => {
        AWSUtils.vpcId = answers.VPC_ID;
        return Promise.resolve();
    })
    .then(() => {
        return AWSUtils.describeSubnetIds();
    })
    .then(subnetIds => {
        return Inquirer.prompt([
            {
                name: 'SUBNET_IDs',
                message: 'Please choose subnet ids:',
                type: 'checkbox',
                choices: subnetIds
            }
        ])
    })
    .then(answers => {
        AWSUtils.subnets = answers.SUBNET_IDs;
        return Promise.resolve();
    })
    .then(() => {
        return new MainMenu().prompt();
    })
    .catch(err => {
        console.error(err);
        process.exit();
    });
};

commandWizard();