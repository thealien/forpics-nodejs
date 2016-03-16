'use strict';

const Processor = require('../services/image/processor');

module.exports = function (app, config/*, container*/) {
    return new Processor(config.imageProcess);
};