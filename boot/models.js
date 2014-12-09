'use strict';

module.exports = function (app, config, container) {
    return require('../models')(app, config, container);
};