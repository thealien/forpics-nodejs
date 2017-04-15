'use strict';

const Router = require('../services/image/router');

module.exports = (app, config) => {
    const {paths} = config.app;
    return new Router({paths});
};