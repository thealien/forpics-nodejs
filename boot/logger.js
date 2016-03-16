'use strict';

const winston = require('winston');

module.exports = function (app, config) {

    const conf = config.logger || [],
        transports = [];

    conf.forEach(function (transportCnf) {
        transports.push(new (winston.transports[transportCnf.type])(transportCnf));
    });

    return new (winston.Logger)({
        transports: transports
    });

};