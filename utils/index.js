'use strict';

var crypto = require('crypto');

exports.rand = function rand (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.guid = (function guid () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4()+s4()+s4()+s4();
    };
})();

exports.md5 = function md5 (input) {
    return crypto.createHash('md5').update(input).digest("hex");
};