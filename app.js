'use strict';

// native modules
var path = require('path');

var config = require('./config');

// helpers/services
var services = require('smallbox');

services.define('app:config', config);

var validatorConfig = config.validation.image,
    validator = require('./services/image/validator').create({
        maxWidth:validatorConfig.max_width,
        maxHeight:validatorConfig.max_height,
        maxSize:validatorConfig.max_size,
        allowedExt:validatorConfig.allowed_ext,
        allowedMime:validatorConfig.allowed_mime
    });

services.define('image:validator', validator);

var processorConfig = config.imageProcess,
    processor = require('./services/image/processor').create(processorConfig);

services.define('image:processor', processor);

// express
var express = require('express'),
    app = express();

// middleware
var logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    multer  = require('multer');

// routes config
var routes = require('./routes');

// view engine setup
var swig = require('swig');
swig.setFilter('fileSize',require('./views/helpers.js').fileSize);
swig.setDefaults({ cache: false });
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer(config.multer));

// setup some "locals"
app.use(function (req, res, next) {
    app.locals.baseUrl = req.protocol + '://' + req.headers.host;
    next();
});

// apply routes config
app.use(routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res/*, next*/) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res/*, next*/) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
