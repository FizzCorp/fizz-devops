# About The Project

This project is part for Fizz platform infrastructure deployment and management. It contains scripts and tools ranging from building infrastructure, managing and monitoring it.

## Built With

* [AWS](https://console.aws.amazon.com/)
* [Cloudformation](https://console.aws.amazon.com/cloudformation/)
* [Node.js](https://nodejs.org/en/)
* [Shell Scripting](https://www.shellscript.sh/)
* [HBase](https://hbase.apache.org/)
* [EMQX](https://www.emqx.io/)

# Getting Started
This project contains everything you need to deploy, manage and monitoring Fizz. There are multiple folders:

### cloud-formation
Contains cloudformation scripts to build infrastructure. You need to deploy script one-by-one in numerical sequence of file.

### custom-tools
Contains customized jmeter library to stress test any mqtt backed infrastructure efficiently.

### database
Contains database initialization and backup scripts.

### docker-stack
Contains docker-compose to deploy services. It mainly serves as local development setup.

### emr
Contains AWS EMR infrastructure deployment scripts for analytics and gdpr jobs

### message-broker
Contains emqx setup, deployment and monitoring script

### monitoring
Contains Grafana custom dashboards for overall Fizz infrastructure monitoring and alerting
