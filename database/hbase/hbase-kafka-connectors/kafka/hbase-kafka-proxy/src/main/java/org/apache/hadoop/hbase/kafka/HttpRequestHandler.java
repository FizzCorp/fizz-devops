package org.apache.hadoop.hbase.kafka;

import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;
import com.squareup.okhttp.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpRequestHandler {
    private static final Logger LOG = LoggerFactory.getLogger(HttpRequestHandler.class);

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public static int doPostRequest(String url, String json) {
        try {
            OkHttpClient client = new OkHttpClient();
            RequestBody body = RequestBody.create(JSON, json);
            Request request = new Request.Builder()
                    .url(url)
                    .post(body)
                    .build();
            Response response = client.newCall(request).execute();
            return response.code();
        } catch (Exception ex) {
            LOG.error(ex.getMessage());
            return -1;
        }
    }
}
