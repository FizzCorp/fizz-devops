FROM dajobe/hbase:latest

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV KAFKA_HOST kafka
ENV KAFKA_PORT 9092
ENV BOOT_TIME 90s

COPY docker-stack/hbase-docker/hbase-connectors/ /data/hbase-connectors/
COPY database/hbase/migrations/ fizz-docker-stack/hbase-docker/setup-hbase.sh /data/fizz-db/

RUN chmod -R u+x /data/hbase-connectors/ && \
    chmod -R u+x /data/fizz-db/ && \
    chmod u+x /data/fizz-db/setup-hbase.sh

CMD sh /data/fizz-db/setup-hbase.sh && tail -f /dev/null