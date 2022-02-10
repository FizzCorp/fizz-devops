#!/bin/bash
HBASE_CLI="hbase"
exec "$HBASE_CLI" shell <<EOF
create 'tsdb' , {NAME => 't' , VERSIONS => 1}
create 'tsdb-meta' , {NAME => 'name'  VERSIONS => 1}
create 'tsdb-tree' , {NAME => 't' ,  VERSIONS => 1}
create 'tsdb-uid' , {NAME => 'id' ,  VERSIONS => 1} , {NAME => 'name' ,  VERSIONS => 1}
EOF
