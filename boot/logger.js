'use strict';

var winston = require('winston');

module.exports = function (app, config) {

    return new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name:         'file#info',
                timestamp:    true,
                json:         false,
                filename: './runtime/logs/info.log',
                maxsize:      100 * 1024,
                maxFiles:     10,
                level: 'info'
            }),
            new (winston.transports.File)({
                name:         'file#error',
                timestamp:    true,
                json:         false,
                maxsize:      100 * 1024,
                maxFiles:     10,
                filename: './runtime/logs/error.log',
                level: 'error'
            })
        ]
    });

};