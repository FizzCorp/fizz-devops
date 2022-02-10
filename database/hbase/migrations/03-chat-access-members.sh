NAMESPACE=$1
HBASE_CLI="hbase"

# chat access
NS_CHAT_ACCESS="chat_access_$NAMESPACE"

TABLE_MEMBER="tbl_member"
CF_MEMBERS="c"

exec "$HBASE_CLI" shell <<EOF

create '$NS_CHAT_ACCESS:$TABLE_MEMBER', {NAME => '$CF_MEMBERS', VERSIONS => 1 }
EOF
