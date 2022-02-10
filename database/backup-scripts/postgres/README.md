# Backup Lambda Deployment


## Postgress Database  Backup

#### Postgress Database Daily Backup


Build and setup Postgres Backup Lambda Stacks
1. Upload the /fizz-devops/database/backup-scripts/postgres/PostgresBackupStackLambda.yml script on cloudformation with the following parameters:
*   DBName: Name of the postgress database that needs backup
*   S3Name: Name of the S3 bucket where the backup is to be stored
*   DBEndpoint: Endpoint of the database that needs backup
*   DBUsername: Username for the database that needs backup
*   DBPassword: Password for the database that needs backup
*   BackupScriptTemplateUrl: the default  value is the link to the cloudformation script for lambdas
2. Create Stack.
3. The lambda functions will automatically take backup everyday.



#### Restore Postgress Database from backups
Import elastic search snapshot from S3
1. Upload the /fizz-devops/database/backup-scripts/postgres/PostgresDBforImport.yml script on cloudformation to create a Postgress Database to import from the backups.

2. Upload the /fizz-devops/database/backup-scripts/postgres/PostgresImportLambdaScripts.yml script on cloudformation with  the following parameters:
*   DBName: Name of the database created in step 1
*   S3Name: Name of the s3 bucket where the Backup is stored
*   DBUsername: Username of the database created in step 1
*   DBPassword: Password of the database created in step 1
*   DBEndpoint: Endpoint of the database created in step 1
*   BackupImportScriptTemplateUrl: Url of the backup import script

3. Create stack
4. Run the lambda function.
5. Once the snapshot has been restored, delete the  Postgress Import Lambda Stack.

