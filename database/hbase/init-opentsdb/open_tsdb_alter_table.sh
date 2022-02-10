#!/bin/bash
HBASE_CLI="hbase"
exec "$HBASE_CLI" shell <<EOF
alter "tsdb" , {NAME => 't' , REPLICATION_SCOPE => 1}
alter "tsdb-meta" , {NAME => 'name' , REPLICATION_SCOPE => 1}
alter "tsdb-tree" , {NAME => 't' , REPLICATION_SCOPE => 1}
alter "tsdb-uid" , {NAME => 'id' , REPLICATION_SCOPE => 1}
alter "tsdb-uid" , {NAME => 'name' , REPLICATION_SCOPE => 1}
EOF
