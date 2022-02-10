'use strict';

class Utils {
    static doSafeCallback(callback, err, data) {
        if (callback) {
            callback(err, data);
        }
    };
}

module.exports = Utils;
