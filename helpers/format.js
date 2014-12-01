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