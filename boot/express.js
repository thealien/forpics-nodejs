'use strict';

const path            = require('path');
const express         = require('express');
const morgan          = require('morgan');
const cookieParser    = require('cookie-parser');

const bodyParser      = require('body-parser');
const multer          = require('multer');
const flash           = require('connect-flash');

const initSwig        = require('./middleware/swig');
const initSessions    = require('./middleware/sessions');
const initLocals      = require('./middleware/locals');

module.exports = function (app, config) {

    initSwig(app, config);

    // console http logs
    if (!app.isProd) {
        app.use(morgan('dev'));
    }

    // forms handling
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    initSessions(app, config);

    app.use(flash());

    app.use(express.static(path.join(__dirname, '../public')));

    app.use(multer(config.multer).fields([{name: "uploadfile[]"}]));

    initLocals(app, config);

    return app;

};


