'use strict';

var path            = require('path');
var express         = require('express');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var RedisStore      = require('connect-redis')(session);
var bodyParser      = require('body-parser');
var multer          = require('multer');
var flash           = require('connect-flash');
var swig            = require('swig');
var viewHelpers     = require('../views/helpers');

module.exports = function (app, config) {

    // view engine setup
    swig.setFilter('fileSize', viewHelpers.fileSize);
    swig.setDefaults({ cache: false });
    app.engine('html', swig.renderFile);
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'html');

    // logging
    app.use(logger('dev'));

    // forms handling
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    // sessions
    var sessionConfig = config.app.session;
    app.use(session({
        secret: sessionConfig.secret,
        store:new RedisStore({prefix:'forpics_sess'}),
        cookie: sessionConfig.cookie
    }));

    app.use(flash());

    app.use(express.static(path.join(__dirname, '../public')));

    app.use(multer(config.multer));


    // setup some "locals"
    app.locals.paths = config.app.paths;
    app.use(function (req, res, next) {
        app.locals.baseUrl = req.protocol + '://' + req.headers.host;
        next();
    });
    app.use(function (req, res, next) {
        app.locals.user = req.user;
        next();
    });

    return app;

};


