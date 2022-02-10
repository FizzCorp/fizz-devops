#!/bin/bash

HBASE_CLI="hbase"
CURRENT_TS=$(date +'%m_%d_%Y' --date='3 day ago')

exec "$HBASE_CLI" shell <<EOF

delete_snapshot 'analytics_tbl_user_snapshot_$CURRENT_TS'
delete_snapshot 'chat_prod_tbl_message_snapshot_$CURRENT_TS'
delete_snapshot 'chat_prod_tbl_uid_snapshot_$CURRENT_TS'
delete_snapshot 'chat_access_prod_tbl_group_snapshot_$CURRENT_TS'
delete_snapshot 'chat_access_prod_tbl_uid_snapshot_$CURRENT_TS'
delete_snapshot 'chat_access_prod_tbl_user_snapshot_$CURRENT_TS'
delete_snapshot 'chat_access_prod_tbl_user_snapshot_$CURRENT_TS'
delete_snapshot 'chat_access_prod_tbl_member_snapshot_$CURRENT_TS'
delete_snapshot 'chat_mod_prod_tbl_config_snapshot_$CURRENT_TS'
delete_snapshot 'chat_app_prod_tbl_app_snapshot_$CURRENT_TS'
delete_snapshot 'chat_group_prod_tbl_group_snapshot_$CURRENT_TS'
delete_snapshot 'chat_group_prod_tbl_user_group_snapshot_$CURRENT_TS'
delete_snapshot 'chat_user_prod_tbl_profile_snapshot_$CURRENT_TS'
delete_snapshot 'tsdb_tsdb_snapshot_$CURRENT_TS'
delete_snapshot 'tsdb_tsdb-meta_snapshot_$CURRENT_TS'
delete_snapshot 'tsdb_tsdb-tree_snapshot_$CURRENT_TS'
delete_snapshot 'tsdb_tsdb-uid_snapshot_$CURRENT_TS'

EOF
