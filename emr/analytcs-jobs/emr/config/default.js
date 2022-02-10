module.exports = {
    analytics: {
        region: process.env.ANALYTICS_REGION || "us-east-1",
        bucket: process.env.ANALYTICS_BUCKET || "fizz-analytics",
        keyPrefix: process.env.ANALYTICS_KEY_PREFIX || "dev/events"
    },
    kinesisStream: {
        name: process.env.ANALYTICS_STREAM || 'fizz-analytics-dev',
        dataDir: "."
    }
}