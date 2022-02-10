package org.apache.hadoop.hbase.kafka;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MetricsCollector {
    private static final MetricsCollector instance = new MetricsCollector();
    private static final Logger LOG = LoggerFactory.getLogger(MetricsCollector.class);

    private static final String APP_ID = "hbase-kafka-proxy";
    private static final String METRIC_RECORD_PROCESSED = "records-processed";
    private static final String METRIC_HEARTBEAT = "heartbeat";
    private static String AMBARI_METRIC_COLLECTOR_URL = "http://localhost:6188/ws/v1/timeline/metrics";
    private static String HOST_NAME = "localhost";

    private static int BATCH_TIME = 60_000;
    private int recordsProcessed = 0;

    public static void init(final String ambariMetricCollector) {
        init(ambariMetricCollector, BATCH_TIME);
    }

    public static void init(final String ambariMetricCollector, final int batchTime) {
        HOST_NAME = ambariMetricCollector;
        AMBARI_METRIC_COLLECTOR_URL = "http://" + ambariMetricCollector + ":6188/ws/v1/timeline/metrics";

        BATCH_TIME = batchTime;
    }

    public static MetricsCollector instance() {
        return instance;
    }

    private MetricsCollector() {
        new Thread(() -> {
            while (true) {
                flush();
                reset();
                try {
                    Thread.sleep(BATCH_TIME);
                } catch (InterruptedException e) {
                    LOG.error("Heartbeat thread exception: " + e.getMessage());
                }
            }
        }).start();
    }

    public void logMetricRecordProcessed(int value) {
        recordsProcessed += value;
    }

    private JsonObject buildMetric(String name, int value) {
        long currTime = System.currentTimeMillis();

        JsonObject metric = new JsonObject();
        metric.addProperty("metricname", name);
        metric.addProperty("appid", APP_ID);
        metric.addProperty("hostname", HOST_NAME);
        metric.addProperty("timestamp", currTime);
        metric.addProperty("starttime", currTime);

        JsonObject point = new JsonObject();
        point.addProperty(String.valueOf(currTime), value);

        metric.add("metrics", point);

        return metric;
    }

    private JsonObject buildRecordProcessedMetric() {
        return buildMetric(METRIC_RECORD_PROCESSED, recordsProcessed);
    }

    private JsonObject buildHeartBeatMetric() {
        return buildMetric(METRIC_HEARTBEAT, 1);
    }

    private void flush() {
        JsonArray metricsList = new JsonArray();
        metricsList.add(buildHeartBeatMetric());
        metricsList.add(buildRecordProcessedMetric());

        JsonObject metrics = new JsonObject();
        metrics.add("metrics", metricsList);

        int responseCode = HttpRequestHandler.doPostRequest(AMBARI_METRIC_COLLECTOR_URL, metrics.toString());
        LOG.info("Metrics logged with status: " + responseCode);
    }

    private void reset() {
        recordsProcessed = 0;
    }
}
