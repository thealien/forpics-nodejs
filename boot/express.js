'use strict';

var path            = require('path');
var express         = require('express');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');

var bodyParser      = require('body-parser');
var multer          = require('multer');
var flash           = require('connect-flash');

var initSwig        = require('./middleware/swig');
var initSessions    = require('./middleware/sessions');
var initLocals      = require('./middleware/locals');

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

    var upload = multer(config.multer);

    app.use(upload.fields([{name: "uploadfile[]"}]));

    initLocals(app, config);

    return app;

};


