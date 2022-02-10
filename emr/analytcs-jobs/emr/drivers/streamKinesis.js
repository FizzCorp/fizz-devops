'use strict';

var aws = require("aws-sdk");
var kinesis = new aws.Kinesis({
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: ""
});

var readStreamRecords = function (iterator, onDone) {
    var params = {
        ShardIterator: iterator,
        Limit: 100
    };
    kinesis.getRecords (params, function (err, data) {
        if (onDone) {
            onDone (err, data.Records);
        }

       if (err) {
           console.log(err);
       }
    });
};

var getShardIds = function (streamName, onDone) {
    var params = {
        StreamName: streamName
    };
    kinesis.describeStream(params, function (err, data) {
        if (err) {
            console.error(err);
        }

        if (onDone) {
            onDone (err, data.StreamDescription.Shards);
        }
    });
};

var createSteamShardIterator = function (streamName, shardId, onDone) {
    var params = {
        ShardId: shardId,
        StreamName: streamName,
        ShardIteratorType: "TRIM_HORIZON"
    };
    kinesis.getShardIterator(params, function (err, data) {
        if (err) {
            if (onDone) {
                onDone (err, null);
            }
        }
        else {
            if (onDone) {
                onDone(err, data.ShardIterator);
            }
        }
    });
};

module.exports.fetchRecords = function (streamName, onDone) {
    getShardIds(streamName, function (err, shards) {
        if (err) {
            if (onDone) {
                onDone(err, null);
            }
        }
        else {
            createSteamShardIterator(streamName, shards[0].ShardId, function (err, iterator) {
                if (err) {
                    console.error(err)
                }
                else {
                    readStreamRecords(iterator, function (err, records) {
                        if (onDone) {
                            onDone(err, records);
                        }
                    });
                }
            });
        }
    });
};