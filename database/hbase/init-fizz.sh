#/bin/bash

namespace=$1
namespace=${namespace:=prod}
startIndex=$2
startindex=${startIndex:=01}
cd /opt/hbase
for entry in ./migrations/*
do
    version=$(echo $entry| cut -d'/' -f 3)
    version=${version:0:2}
    if [ $version -ge $startIndex ]
    then
        sh "$entry" $namespace
    fi
done
