peerip=$1":2181:/hbase-unsecure"
HBASE_CLI="hbase"

exec "$HBASE_CLI" shell <<EOF

add_peer '1', CLUSTER_KEY => "$peerip"
EOF

