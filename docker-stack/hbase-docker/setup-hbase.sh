/opt/hbase-server & 
echo "[$(date +"%T")] going to sleep"
sleep $BOOT_TIME
echo "[$(date +"%T")] coming back from sleep"
/data/hbase-connectors/bin/hbase-connectors-daemon.sh start kafkaproxy -a -e -p kafkaProxy -b $KAFKA_HOST:$KAFKA_PORT
sh data/fizz-db/01-init-schema.sh dev
sh data/fizz-db/02-app-config.sh dev
sh data/fizz-db/03-chat-access-members.sh dev
sh data/fizz-db/04-hbase-kakfa-events.sh dev
sh data/fizz-db/05-chat-group.sh dev
sh data/fizz-db/06-user-profile.sh dev
sh data/fizz-db/07-chat-app.sh dev