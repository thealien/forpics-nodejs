'use strict';

var winston = require('winston');

module.exports = function (app, config) {

    var conf = config.logger || [],
        transports = [];

    conf.forEach(function (transportCnf, name) {
        transports.push(new (winston.transports[transportCnf.type])(transportCnf));
    });

    return new (winston.Logger)({
        transports: transports
    });

};