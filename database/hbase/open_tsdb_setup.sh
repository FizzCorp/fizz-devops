#!/bin/bash
sudo yum install autoconf -y
sudo yum install automake -y

cd /opt/hbase
mkdir opentsdb
cd opentsdb
sh /opt/hbase/init-opentsdb/tsdb_tables.sh
wget https://github.com/OpenTSDB/opentsdb/releases/download/v2.4.0/opentsdb-2.4.0.noarch.rpm
rpm -Uvh --nodeps opentsdb-2.4.0.noarch.rpm
cd ..
nohup tsdb tsd --port=4242 zkquorum=localhost:2181 --zkbasedir=/hbase-unsecure --auto-metric=true  >/dev/null 2>&1 & exit

