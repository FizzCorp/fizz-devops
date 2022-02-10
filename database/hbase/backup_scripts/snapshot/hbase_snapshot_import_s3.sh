#!/bin/bash
HBASE_CLI="hbase"
CURRENT_TS=$(date +'%m_%d_%Y' --date='0 day ago')
PATH_POSTFIX=$(date +'%m-%Y' --date='0 day ago')

S3_PATH=<<s3BackupBucketPath>>
LOCAL_HDFS_PATH="/user/hbase"
HBASE_ROOT_DIR="/apps/hbase/data"

NS_DEFAULT="default"
NS_CHAT="chat_prod"
NS_ANALYTICS="analytics"
NS_CHAT_ACCESS="chat_access_prod"
NS_CHAT_MOD="chat_mod_prod"
NS_CHAT_APP="chat_app_prod"
NS_GATEWAY="gateway_prod"
NS_CHAT_GROUP="chat_group_prod"
NS_CHAT_USER="chat_user_prod"

TABLE_UID="tbl_uid"
TABLE_USER="tbl_user"
TABLE_MEMBER="tbl_member"
TABLE_GROUP="tbl_group"
TABLE_MESSAGE="tbl_message"
TABLE_CONFIG="tbl_config"
TABLE_APP="tbl_app"
TABLE_USER_GROUP="tbl_user_group"
TABLE_PROFILE="tbl_profile"
TABLE_TSDB="tsdb"
TABLE_TSDB_META="tsdb-meta"
TABLE_TSDB_TREE="tsdb-tree"
TABLE_TSDB_UID="tsdb-uid"
TABLE_SESSION="tbl_session"
CF_SESSION_CONTENT="c"

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

sudo -u hdfs \
hbase snapshot export -snapshot $ANALYTICS_TBL_USER_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_GROUP_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_UID_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_USER_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_ACCESS_PROD_TBL_MEMBER_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_PROD_TBL_MESSAGE_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_PROD_TBL_UID_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_MOD_PROD_TBL_CONFIG_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_APP_PROD_TBL_APP_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_GROUP_PROD_TBL_GROUP_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_GROUP_PROD_TBL_USER_GROUP_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $CHAT_USER_PROD_TBL_PROFILE_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $TSDB_TSDB_META_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $TSDB_TSDB_TREE_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $TSDB_TSDB_UID_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

sudo -u hdfs \
hbase snapshot export -snapshot $TSDB_TSDB_SNAPSHOT \
-copy-from s3a://$S3_PATH \
-copy-to hdfs://$LOCAL_HDFS_PATH \
-mappers 2 -overwrite
wait

#Create required directories
sudo -u hbase hdfs dfs -cp $LOCAL_HDFS_PATH/.hbase-snapshot $HBASE_ROOT_DIR/

#NS_CHAT
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT $TABLE_MESSAGE $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT $TABLE_UID $LOCAL_HDFS_PATH

#NS_ANALYTICS
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_ANALYTICS $TABLE_USER $LOCAL_HDFS_PATH

#NS_CHAT_ACCESS
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_ACCESS $TABLE_GROUP $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_ACCESS $TABLE_UID $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_ACCESS $TABLE_USER $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_ACCESS $TABLE_MEMBER $LOCAL_HDFS_PATH

#NS_CHAT_MOD
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_MOD $TABLE_CONFIG $LOCAL_HDFS_PATH

#NS_CHAT_APP
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_APP $TABLE_APP $LOCAL_HDFS_PATH

#NS_CHAT_GROUP
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_GROUP $TABLE_GROUP $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_GROUP $TABLE_USER_GROUP $LOCAL_HDFS_PATH

#NS_CHAT_USER
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_CHAT_USER $TABLE_PROFILE $LOCAL_HDFS_PATH

#OPEN_TSDB
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_DEFAULT $TABLE_TSDB $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_DEFAULT $TABLE_TSDB_META $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_DEFAULT $TABLE_TSDB_TREE $LOCAL_HDFS_PATH
sh ./hbase_snapshot_import_copy_archive.sh $HBASE_ROOT_DIR $NS_DEFAULT $TABLE_TSDB_UID $LOCAL_HDFS_PATH

# Create Namespaces and clone snapshots in hbase shell
exec "$HBASE_CLI" shell <<EOF

create_namespace '$NS_CHAT'
create_namespace '$NS_ANALYTICS'
create_namespace '$NS_CHAT_ACCESS'
create_namespace '$NS_CHAT_MOD'
create_namespace '$NS_CHAT_APP'
create_namespace '$NS_GATEWAY'
create_namespace '$NS_CHAT_GROUP'
create_namespace '$NS_CHAT_USER'

clone_snapshot '$ANALYTICS_TBL_USER_SNAPSHOT', '$NS_ANALYTICS:$TABLE_USER'
clone_snapshot '$CHAT_ACCESS_PROD_TBL_GROUP_SNAPSHOT', '$NS_CHAT_ACCESS:$TABLE_GROUP'
clone_snapshot '$CHAT_ACCESS_PROD_TBL_UID_SNAPSHOT', '$NS_CHAT_ACCESS:$TABLE_UID'
clone_snapshot '$CHAT_ACCESS_PROD_TBL_USER_SNAPSHOT', '$NS_CHAT_ACCESS:$TABLE_USER'
clone_snapshot '$CHAT_ACCESS_PROD_TBL_MEMBER_SNAPSHOT', '$NS_CHAT_ACCESS:$TABLE_MEMBER'
clone_snapshot '$CHAT_PROD_TBL_MESSAGE_SNAPSHOT', '$NS_CHAT:$TABLE_MESSAGE'
clone_snapshot '$CHAT_PROD_TBL_UID_SNAPSHOT', '$NS_CHAT:$TABLE_UID'
clone_snapshot '$CHAT_MOD_PROD_TBL_CONFIG_SNAPSHOT', '$NS_CHAT_MOD:$TABLE_CONFIG'
clone_snapshot '$CHAT_APP_PROD_TBL_APP_SNAPSHOT', '$NS_CHAT_APP:$TABLE_APP'
clone_snapshot '$CHAT_GROUP_PROD_TBL_GROUP_SNAPSHOT', '$NS_CHAT_GROUP:$TABLE_GROUP'
clone_snapshot '$CHAT_GROUP_PROD_TBL_USER_GROUP_SNAPSHOT', '$NS_CHAT_GROUP:$TABLE_USER_GROUP'
clone_snapshot '$CHAT_USER_PROD_TBL_PROFILE_SNAPSHOT', '$NS_CHAT_USER:$TABLE_PROFILE'
clone_snapshot '$TSDB_TSDB_SNAPSHOT', '$TABLE_TSDB'
clone_snapshot '$TSDB_TSDB_META_SNAPSHOT', '$TABLE_TSDB_META'
clone_snapshot '$TSDB_TSDB_TREE_SNAPSHOT', '$TABLE_TSDB_TREE'
clone_snapshot '$TSDB_TSDB_UID_SNAPSHOT', '$TABLE_TSDB_UID'

create '$NS_GATEWAY:$TABLE_SESSION', {NAME => '$CF_SESSION_CONTENT', VERSIONS => 1, TTL => 86400}

EOF
