#!/bin/bash
echo "Enter MSK cluster name"
read MSK_CLUSTER_NAME

echo "Enter EMQX cluser name"
read EMQX_CLUSER_NAME

echo "Enter Hbase master private dns"
read HBASE_MASTER_PRIVATE_DNS

echo "Enter Hbase slave private dns"
read HBASE_SLAVE_PRIVATE_DNS

echo "Enter API Gateway blue environment name"
read API_GATEWAY_BLUE_ENVIRONMENT_NAME

echo "Enter API Gateway blue load balancer name"
read API_GATEWAY_BLUE_LOAD_BALANCER_NAME

echo "Enter API Gateway blue auto scaling group name"
read API_GATEWAY_BLUE_AUTO_SCALING_GROUP_NAME

echo "Enter API Gateway green environment name"
read API_GATEWAY_GREEN_ENVIRONMENT_NAME

echo "Enter API Gateway green load balancer name"
read API_GATEWAY_GREEN_LOAD_BALANCER_NAME

echo "Enter API Gateway green auto scaling group name"
read API_GATEWAY_GREEN_AUTO_SCALING_GROUP_NAME

echo "Enter Elastic search domain name"
read ELASTIC_SEARCH_DOMAIN_NAME

echo "Enter AWS Account ID"
read AWS_ACCOUNT_ID

echo "Enter Redis cluster node name"
read REDIS_CLUSTER_NODE_NAME

echo "Enter Keycloak environment name"
read KEYCLOAK_ENVIRONMENT_NAME

echo "Enter Keycloak loadbalancer name"
read KEYCLOAK_LOAD_BALANCER_NAME

echo "Enter Keycloak autoscaling group name"
read KEYCLOAK_AUTO_SCALING_GROUP_NAME


sed -i 's/%EMQX_CLUSER_NAME%/'$EMQX_CLUSER_NAME'/g' EmqxGrafanaDashboard.json
sed -i 's/%EMQX_CLUSER_NAME%/'$EMQX_CLUSER_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%MSK_CLUSTER_NAME%/'$MSK_CLUSTER_NAME'/g' MskDashboard.json
sed -i 's/%MSK_CLUSTER_NAME%/'$MSK_CLUSTER_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%HBASE_MASTER_PRIVATE_DNS%/'$HBASE_MASTER_PRIVATE_DNS'/g' HbasegrafanaDashboard.json
sed -i 's/%HBASE_MASTER_PRIVATE_DNS%/'$HBASE_MASTER_PRIVATE_DNS'/g' FizzGrafanaDashboard.json
sed -i 's/%HBASE_SLAVE_PRIVATE_DNS%/'$HBASE_SLAVE_PRIVATE_DNS'/g' HbasegrafanaDashboard.json
sed -i 's/%HBASE_SLAVE_PRIVATE_DNS%/'$HBASE_SLAVE_PRIVATE_DNS'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_BLUE_ENVIRONMENT_NAME%/'$API_GATEWAY_BLUE_ENVIRONMENT_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_BLUE_LOAD_BALANCER_NAME%/'$API_GATEWAY_BLUE_LOAD_BALANCER_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_BLUE_AUTO_SCALING_GROUP_NAME%/'$API_GATEWAY_BLUE_AUTO_SCALING_GROUP_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_GREEN_ENVIRONMENT_NAME%/'$API_GATEWAY_GREEN_ENVIRONMENT_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_GREEN_LOAD_BALANCER_NAME%/'$API_GATEWAY_GREEN_LOAD_BALANCER_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%API_GATEWAY_GREEN_AUTO_SCALING_GROUP_NAME%/'$API_GATEWAY_GREEN_AUTO_SCALING_GROUP_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%ELASTIC_SEARCH_DOMAIN_NAME%/'$ELASTIC_SEARCH_DOMAIN_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%AWS_ACCOUNT_ID%/'$AWS_ACCOUNT_ID'/g' FizzGrafanaDashboard.json
sed -i 's/%REDIS_CLUSTER_NODE_NAME%/'$REDIS_CLUSTER_NODE_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%KEYCLOAK_ENVIRONMENT_NAME%/'$KEYCLOAK_ENVIRONMENT_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%KEYCLOAK_LOAD_BALANCER_NAME%/'$KEYCLOAK_LOAD_BALANCER_NAME'/g' FizzGrafanaDashboard.json
sed -i 's/%KEYCLOAK_AUTO_SCALING_GROUP_NAME%/'$KEYCLOAK_AUTO_SCALING_GROUP_NAME'/g' FizzGrafanaDashboard.json

