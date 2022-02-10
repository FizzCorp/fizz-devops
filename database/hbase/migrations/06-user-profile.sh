NAMESPACE=$1
HBASE_CLI="hbase"

# chat group
NS_USER_PROFILE="chat_user_$NAMESPACE"
TABLE_PROFILE="tbl_profile"
CF_USERS_PROFILE="c"

exec "$HBASE_CLI" shell <<EOF
create_namespace '$NS_USER_PROFILE'

create '$NS_USER_PROFILE:$TABLE_PROFILE', {NAME => '$CF_USERS_PROFILE', VERSIONS => 1}
EOF
