'use strict';

const job = require('../dailyBatchJob');

job.handler(null, null, (err, data) => {
    if (err) {
        console.error (err);
    }
    console.log (data);
})