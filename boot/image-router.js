'use strict';

const Router = require('../services/image/router');

module.exports = (app, config) => {
    const {paths, protocol, host} = config.app;
    return new Router({
        paths,
        protocol,
        host
    });
};