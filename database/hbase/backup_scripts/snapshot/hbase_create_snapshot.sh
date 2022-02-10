#!/bin/bash

HBASE_CLI="hbase"
CURRENT_TS=$(date +'%m_%d_%Y')

exec "$HBASE_CLI" shell <<EOF

snapshot 'analytics:tbl_user', 'analytics_tbl_user_snapshot_$CURRENT_TS'
snapshot 'chat_prod:tbl_message', 'chat_prod_tbl_message_snapshot_$CURRENT_TS'
snapshot 'chat_prod:tbl_uid', 'chat_prod_tbl_uid_snapshot_$CURRENT_TS'
snapshot 'chat_access_prod:tbl_group', 'chat_access_prod_tbl_group_snapshot_$CURRENT_TS'
snapshot 'chat_access_prod:tbl_uid', 'chat_access_prod_tbl_uid_snapshot_$CURRENT_TS'
snapshot 'chat_access_prod:tbl_user', 'chat_access_prod_tbl_user_snapshot_$CURRENT_TS'
snapshot 'chat_access_prod:tbl_member', 'chat_access_prod_tbl_member_snapshot_$CURRENT_TS'
snapshot 'chat_mod_prod:tbl_config', 'chat_mod_prod_tbl_config_snapshot_$CURRENT_TS'
snapshot 'chat_app_prod:tbl_app', 'chat_app_prod_tbl_app_snapshot_$CURRENT_TS'
snapshot 'chat_group_prod:tbl_group', 'chat_group_prod_tbl_group_snapshot_$CURRENT_TS'
snapshot 'chat_group_prod:tbl_user_group', 'chat_group_prod_tbl_user_group_snapshot_$CURRENT_TS'
snapshot 'chat_user_prod:tbl_profile', 'chat_user_prod_tbl_profile_snapshot_$CURRENT_TS'
snapshot 'tsdb', 'tsdb_tsdb_snapshot_$CURRENT_TS'
snapshot 'tsdb-meta', 'tsdb_tsdb-meta_snapshot_$CURRENT_TS'
snapshot 'tsdb-tree', 'tsdb_tsdb-tree_snapshot_$CURRENT_TS'
snapshot 'tsdb-uid', 'tsdb_tsdb-uid_snapshot_$CURRENT_TS'

EOF
