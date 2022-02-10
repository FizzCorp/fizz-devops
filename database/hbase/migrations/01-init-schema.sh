NAMESPACE=$1

HBASE_CLI="hbase"

# analytics
NS_ANALYTICS="analytics"
TABLE_USER="tbl_user"
CF_ANALYTICS_USERS="p"

# chat
NS_CHAT="chat_$NAMESPACE"

TABLE_MESSAGE="tbl_message"
CF_MESSAGE_CONTENT="c"

TABLE_UID="tbl_uid"
CF_UID_COUNTER="ctr"
CF_UID_ID="id"

# chat access
NS_CHAT_ACCESS="chat_access_$NAMESPACE"

TABLE_GROUP="tbl_group"
CF_MEMBERS="mb"

TABLE_USER="tbl_user"
CF_MAPPINGS="mp"

# api gateway
NS_GATEWAY="gateway_$NAMESPACE"
TABLE_SESSION="tbl_session"
CF_SESSION_CONTENT="c"

exec "$HBASE_CLI" shell <<EOF
create_namespace '$NS_ANALYTICS'
create_namespace '$NS_CHAT'
create_namespace '$NS_CHAT_ACCESS'
create_namespace '$NS_GATEWAY'

create '$NS_ANALYTICS:$TABLE_USER', {NAME => '$CF_ANALYTICS_USERS', VERSIONS => 1 , TTL => 2628000 }

create '$NS_CHAT:$TABLE_MESSAGE', {NAME => '$CF_MESSAGE_CONTENT', VERSIONS => 1 , TTL => 7884000 }

create '$NS_CHAT:$TABLE_UID', {NAME => '$CF_UID_COUNTER', VERSIONS => 1}, {NAME => '$CF_UID_ID', VERSIONS => 1 }

create '$NS_CHAT_ACCESS:$TABLE_GROUP', {NAME => '$CF_MEMBERS', VERSIONS => 1 }

create '$NS_CHAT_ACCESS:$TABLE_USER', {NAME => '$CF_MAPPINGS', VERSIONS => 1 }

create '$NS_CHAT_ACCESS:$TABLE_UID', {NAME => '$CF_UID_COUNTER', VERSIONS => 1 }, {NAME => '$CF_UID_ID', VERSIONS => 1 }

create '$NS_GATEWAY:$TABLE_SESSION', {NAME => '$CF_SESSION_CONTENT', VERSIONS => 1, TTL => 86400}

EOF

