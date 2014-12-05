'use strict';

function generateFilename(max){
    var g = guid();
    max = +max || g.length;
    return g.substr(0, rand(7, max));
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4()+s4()+s4()+s4();
    };
})();

exports.generateFilename = generateFilename;
exports.guid = guid;
exports.rand = rand;
