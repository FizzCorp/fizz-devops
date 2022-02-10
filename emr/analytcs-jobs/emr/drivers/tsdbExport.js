'use strict';

const tsdbExport = require('../tsdbExport');

tsdbExport.handler(null, null, (err, data) => {
    if (err) {
        console.error (err);
    }
    console.log (data);
})