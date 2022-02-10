# Backup Lambda Deployment
## ElasticSearch Backup

#### ElasticSearch Daily Backups on S3
Build and setup EsalticSearch Snapshot Lambda Stacks

1. Register an S3 Bucket with elastic search following Register S3 with "ElasticSearch" guide. 

2. Upload the /fizz-devops/database/backup-scripts/elasticsearch/ESSnapshotLambda.yml script on cloudformation for building the lambda funtions to take ES snapshots everyday with  the following parameters:
*   EsSnapshotEndpoint:T he end point of the Elastic Search that needs to be backed up
*   Region: Region in  which the elastic search is hosted
*   S3Name: Name of  the  bucket that will store the backup
*   EsSnapshotScriptTemplateURL:Url of Cloudformation Es Snapshot Script that the lambda will use 
*   ESSecurityGroupName: Name of the security group attached with Elastic Search
*   KeyName: Name of an existing EC2 KeyPair to enable SSH access to the instance

3. Create stack
4. The lambda functions will automatically take a snapshot and store it on S3 everyday.



#### Register S3 with ElasticSearch
Register S3 with ElasticSearch:

1. Upload the /fizz-devops/database/backup-scripts/elasticsearch/ESS3RegisterLambda.yml script on cloudformation with the following parameters to register an existing  S3 bucket with the elastic search:
*   EsEndpoint: The end point of the Elastic Search that needs to be backed up
*   Region:Region in  which the elastic search is hosted
*   S3Name:Name of  the  bucket that needs to be registered
*   RegisterScriptTemplateUrl: Url of Cloudformation Register Script that the lambda will use 
*   ESSecurityGroupName: Name of the security group attached with Elastic Search
*   KeyName: Name of an existing EC2 KeyPair to enable SSH access to the instance

2. Create stack and run the  lambda function , it will register the S3 bucket with Elastic search 

3. Delete the ES S3 Register Lambda stack.



#### Restore ElasticSearch from Snapshots
Restore ElasticSearch using snapshots stored on S3

1. Register an S3 Bucket with elastic search following Register S3 with "ElasticSearch" guide.
2. Upload the /fizz-devops/database/backup-scripts/elasticsearch/ESSnapshotImportLambda.yml script on cloudformation with  the following parameters:
*   EsRestoreEndpoint: The end point of the Elastic Search where the snapshot is to be restored
*   Region:Region in  which the elastic search is hosted
*   S3Name: Name of  the  bucket in which the backups are stored
*   EsRestoreSnapshotScriptTemplateURL: URL of Cloudformation Es Snapshot Script that the lambda will use
*   ESSecurityGroupName: Name of the security group attached with Elastic Search
*   KeyName: Name of an existing EC2 KeyPair to enable SSH access to the instance
  
5. Create stack
6. Run the lambda function.
7. Once the snapshot has been restored, delete the  ES Snapshot Import Lambda Stack.