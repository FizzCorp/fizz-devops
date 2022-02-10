#!/bin/bash

sh /opt/hbase/backup_scripts/snapshot/hbase_create_snapshot.sh
sh /opt/hbase/backup_scripts/snapshot/hbase_snapshot_export_s3.sh
sh /opt/hbase/backup_scripts/snapshot/hbase_delete_snapshot.sh
