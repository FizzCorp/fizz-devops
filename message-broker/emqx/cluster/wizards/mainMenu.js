'use strict';

const Inquirer = require('inquirer');
const ClusterWizard = require('./cluster');
const DeleteClusterWizard = require('./deleteCluster');
const RunConfigBuilder = require('./runConfigBuilder');
const RunConfigWizard =  require('./runConfig');

const TEXT_CREATE_EMQX_CLUSTER = 'Deploy a new EMQX cluster.';
const TEXT_DELETE_EMQX_CLUSTER = 'Delete the EMQX cluster.';
const TEXT_CREATE_EMQX_NODE_CONFIG = 'Create a EMQX node run config.';
const TEXT_PUBLISH_EMQX_NODE_CONFIG = 'Publish a EMQX node run config.';
const TEXT_EXIT = 'Exit.';

class Wizard {
    constructor() {
        this.defaultSelection = TEXT_CREATE_EMQX_CLUSTER;
    }

    prompt() {
        return Inquirer.prompt([
            {
                name: 'COMMAND',
                message: 'Please select a command:',
                type: 'list',
                choices: [
                    TEXT_CREATE_EMQX_CLUSTER,
                    TEXT_DELETE_EMQX_CLUSTER,
                    TEXT_CREATE_EMQX_NODE_CONFIG,
                    TEXT_PUBLISH_EMQX_NODE_CONFIG,
                    TEXT_EXIT
                ],
                default: this.defaultSelection
            }
        ])
        .then(answers => {
            let completed;
            let creationWizard;

            if (answers.COMMAND === TEXT_CREATE_EMQX_CLUSTER) {
                creationWizard = new ClusterWizard();
                completed = creationWizard.prompt();
            }
            else
            if (answers.COMMAND === TEXT_DELETE_EMQX_CLUSTER) {
                completed = new DeleteClusterWizard().prompt();
            }
            else
            if (answers.COMMAND === TEXT_CREATE_EMQX_NODE_CONFIG) {
                completed = new RunConfigBuilder({}, false).prompt(true);
            }
            else
            if (answers.COMMAND === TEXT_PUBLISH_EMQX_NODE_CONFIG) {
                completed = new RunConfigWizard().prompt();
            }
        
            if (completed) {
                completed.then(() => {
                    this.defaultSelection = TEXT_EXIT;
                    this.prompt();
                })
                .catch(err => {
                    console.error(err);
                    if (creationWizard) {
                        return Inquirer.prompt([
                            {
                                name: 'DELETE_CLUSTER',
                                message: 'Do you want to delete the cluster (default yes)?',
                                type: 'confirm',
                                default: true
                            }
                        ])
                        .then(answers => {
                            if (answers.DELETE_CLUSTER) {
                                return new DeleteClusterWizard().silent(creationWizard.context.name)
                            }
                            return Promise.resolve();
                        })
                    }
                    else {
                        process.exit();
                    }
                });
            }
        });
    }
}

module.exports = Wizard;
