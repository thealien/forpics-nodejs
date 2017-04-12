'use strict';

const winston = require('winston');

module.exports = (app, config) => {
    const transports = [...config.logger].map(transportCnf => {
        const LoggerConstructor = winston.transports[transportCnf.type];
        return new LoggerConstructor(transportCnf);
    });

    return new (winston.Logger)({transports});
};