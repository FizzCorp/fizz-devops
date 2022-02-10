#!/bin/bash
CURRENT_TS=$(date +'%m_%d_%Y')
PATH_POSTFIX=$(date +'%m-%Y')

S3_PATH=<<s3BackupBucketPath>>

ANALYTICS_TBL_USER_SNAPSHOT="analytics_tbl_user_snapshot_$CURRENT_TS"
CHAT_ACCESS_PROD_TBL_GROUP_SNAPSHOT="chat_access_prod_tbl_group_snapshot_$CURRENT_TS"
CHAT_ACCESS_PROD_TBL_UID_SNAPSHOT="chat_access_prod_tbl_uid_snapshot_$CURRENT_TS"
CHAT_ACCESS_PROD_TBL_USER_SNAPSHOT="chat_access_prod_tbl_user_snapshot_$CURRENT_TS"
CHAT_ACCESS_PROD_TBL_MEMBER_SNAPSHOT="chat_access_prod_tbl_member_snapshot_$CURRENT_TS"
CHAT_PROD_TBL_MESSAGE_SNAPSHOT="chat_prod_tbl_message_snapshot_$CURRENT_TS"
CHAT_PROD_TBL_UID_SNAPSHOT="chat_prod_tbl_uid_snapshot_$CURRENT_TS"
CHAT_MOD_PROD_TBL_CONFIG_SNAPSHOT="chat_mod_prod_tbl_config_snapshot_$CURRENT_TS"
CHAT_APP_PROD_TBL_APP_SNAPSHOT="chat_app_prod_tbl_app_snapshot_$CURRENT_TS"
CHAT_GROUP_PROD_TBL_GROUP_SNAPSHOT="chat_group_prod_tbl_group_snapshot_$CURRENT_TS"
CHAT_GROUP_PROD_TBL_USER_GROUP_SNAPSHOT="chat_group_prod_tbl_user_group_snapshot_$CURRENT_TS"
CHAT_USER_PROD_TBL_PROFILE_SNAPSHOT="chat_user_prod_tbl_profile_snapshot_$CURRENT_TS"
TSDB_TSDB_SNAPSHOT="tsdb_tsdb_snapshot_$CURRENT_TS"
TSDB_TSDB_META_SNAPSHOT="tsdb_tsdb-meta_snapshot_$CURRENT_TS"
TSDB_TSDB_TREE_SNAPSHOT="tsdb_tsdb-tree_snapshot_$CURRENT_TS"
TSDB_TSDB_UID_SNAPSHOT="tsdb_tsdb-uid_snapshot_$CURRENT_TS"

hbase snapshot export -snapshot $ANALYTICS_TBL_USER_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_GROUP_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_UID_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_USER_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_MEMBER_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_PROD_TBL_MESSAGE_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_PROD_TBL_UID_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_MOD_PROD_TBL_CONFIG_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_APP_PROD_TBL_APP_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_GROUP_PROD_TBL_GROUP_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_GROUP_PROD_TBL_USER_GROUP_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $CHAT_USER_PROD_TBL_PROFILE_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $TSDB_TSDB_META_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $TSDB_TSDB_TREE_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $TSDB_TSDB_UID_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
wait

hbase snapshot export -snapshot $TSDB_TSDB_SNAPSHOT \
-copy-to s3a://$S3_PATH \
-mappers 2 -overwrite
