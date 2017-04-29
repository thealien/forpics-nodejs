'use strict';

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const ipv4 = require('express-ipv4');

const initSwig = require('./middleware/swig');
const initSessions = require('./middleware/sessions');
const initLocals = require('./middleware/locals');

module.exports = (app, config, container) => {
    initSwig(app, config, container);

    // console http logs
    if (!app.isProd) {
        app.use(morgan('dev'));
    }

    app.enable('trust proxy');
    app.use(ipv4());

    // forms handling
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());

    initSessions(app, config, container);

    app.use(flash());
    app.use(express['static'](path.join(__dirname, '../public')));

    initLocals(app, config, container);

    return app;
};