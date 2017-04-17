'use strict';

exports.fileSize = function (size) {
    var kb = 1024,
        u, units;
    if(size < kb) {
        return size + ' B';
    }
    units = ['КB','MB','GB','TB','PB','EB','ZB','YB'];
    u = -1;
    do {
        size /= kb;
        ++u;
    } while(size >= kb);
    return size.toFixed(1)+' '+units[u];
};

exports.range = function (a, b) {
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    const range = [];
    for (let i = from; i <= to; i++) {
        range.push(i);
    }
    return range;
};