'use strict';

module.exports = function (router, config, container) {
    var app = container.require('app:core'),
        logger = container.require('app:logger');

    // error handlers

    // catch 404 and forward to error handler
    router.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        router.use(function(err, req, res, next) {
            logger.error(err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    router.use(function(err, req, res, next) {
        logger.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

};