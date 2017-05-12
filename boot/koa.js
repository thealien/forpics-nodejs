'use strict';

const express = require('express');
const morgan = require('koa-morgan');
const bodyParser = require('koa-bodyparser');
const flash = require('koa-flash-simple');

const initSwig = require('./middleware/swig');
const initSessions = require('./middleware/sessions');

module.exports = (app, config, container) => {
    // trust proxy headers
    app.proxy = true;

    // init templates engine
    initSwig(app, config, container);

    // console http logs
    if (!app.context.isProd) {
        app.use(morgan('dev'));
    }

    // forms handling
    app.use(bodyParser());

    // session support
    initSessions(app, config, container);

    // support flash messages
    app.use(flash());
    return app;
};