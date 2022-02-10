const scheduler = require ('../rollup');

scheduler.handler (null, null, (err, data) => {
    if (err) console.log (err);
    else console.log (data);
});