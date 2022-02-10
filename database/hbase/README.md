## Initialize Hbase
Run following commands and give the required input according to the backup or main cluster

```
sudo su 
cd /tmp
git clone -b opensource https://<<userid>>:<<password>>@gitlab.com/fizzcorp/fizz-devops.git
mv /tmp/fizz-devops/database/hbase /opt
rm -rf /tmp/fizz-devops/
sh /opt/hbase/hbase-config.sh