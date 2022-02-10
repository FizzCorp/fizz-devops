Step 1) Run following commands
```
mkdir /hbase-automation-helper-scripts
chmod 777 /hbase_backup_scripts
```
Step 2) Copy all script files to /hbase_backup_scripts

Step 3) Add Cronjob
```
crontab -e 0 11 * * * sh /opt/hbase-automation-helper-scripts/hbase-log-deletion.sh
```
