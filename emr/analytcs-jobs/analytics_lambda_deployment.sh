#!/bin/bash
sh deploy_lambda.sh fizz-analytics-full-jobs ./emr dailyBatchJob.js
sh deploy_lambda.sh fizz-analytics-stream-processing-job ./emr dailyJobEventStreaming.js