
Step 1) Update the S3_PATH variable with the path of the bucket where you want to place the back up i.e "s3BackupBucketPath" in hbase_snapshot_export_s3.sh and hbase_snapshot_import_s3.sh

Step 2) Run following commands
```
mkdir /hbase_backup_scripts
chmod 777 /hbase_backup_scripts
mkdir /hbase_backup_scripts/logs/
chmod 777 /hbase_backup_scripts/logs/
```

Step 3) Copy all script files to /hbase_backup_scripts

Step 4) Add Cronjob
```
crontab -e 0 5 * * * sh /backup_scripts/snapshot/hbase_snapshot.sh >> /hbase_backup_scripts/logs/hbase_backup.txt 2>&1
```

