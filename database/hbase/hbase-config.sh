#!/bin/bash
crontab -l | { cat; echo "0 11 * * * sh /opt/hbase/automation-helper-scripts/hbase-log-deletion.sh"; }| crontab -

sh /opt/hbase/init-fizz.sh
echo "ran init"
sh /opt/hbase/open_tsdb_setup.sh
echo "ran open"
        mkdir /hbase_backup_scripts
        chmod 777 /hbase_backup_scripts
        mkdir /hbase_backup_scripts/logs/
        chmod 777 /hbase_backup_scripts/logs/
        crontab -l | { cat; echo "0 5 * * * sh /opt/hbase/backup_scripts/snapshot/hbase_snapshot.sh >> /hbase_backup_scripts/logs/hbase_backup.txt 2>&1"; echo "0 11 * * * sh /opt/hbase/automation-helper-scripts/hbase-log-deletion.sh"; }| crontab -



