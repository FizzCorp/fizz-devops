#!/bin/bash

sudo -u hbase hdfs dfs -mkdir -p $1/archive/data/$2/$3/
sudo -u hbase hdfs dfs -cp $4/archive/data/$2/$3 $1/archive/data/$2/