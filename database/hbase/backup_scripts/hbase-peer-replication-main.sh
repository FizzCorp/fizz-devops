read -p "Please enter the Priate DNS of the backup server" peer
peerip=$peer":2181:/hbase-unsecure"
HBASE_CLI="hbase"

exec "$HBASE_CLI" shell <<EOF

add_peer '1', CLUSTER_KEY => "$peerip"
EOF

sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip analytics:tbl_user
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_prod:tbl_message
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_prod:tbl_uid
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_access_prod:tbl_group
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_access_prod:tbl_uid
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_access_prod:tbl_user
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_access_prod:tbl_member
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_mod_prod:tbl_config
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_app_prod:tbl_app
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_group_prod:tbl_group
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_group_prod:tbl_user_group
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip chat_user_prod:tbl_profile
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip tsdb
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip tsdb-meta
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip tsdb-tree
sudo -u hbase hbase org.apache.hadoop.hbase.mapreduce.CopyTable --peer.adr=$peerip tsdb-uid
