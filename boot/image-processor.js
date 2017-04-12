'use strict';

const Processor = require('../services/image/processor');

module.exports = (app, config) => new Processor(config.imageProcess);