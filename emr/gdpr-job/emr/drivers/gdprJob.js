'use strict';

const job = require('../gdprJob');

job.handler(null, null, (err, data) => {
    if (err) {
        console.error (err);
    }
    console.log (data);
})