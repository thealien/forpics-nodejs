'use strict';

module.exports = (router, config, container) => {
    const app = container.require('app:core');
    const logger = container.require('app:logger');

    // error handlers

    // catch 404 and forward to error handler
    router.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // development error handler
    // will print stacktrace
    if (!app.isProd) {
        router.use((err, req, res, next) => {
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
    router.use((err, req, res, next) => {
        logger.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

};