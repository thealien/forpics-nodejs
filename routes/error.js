'use strict';

module.exports = (router, config, container) => {
    const app = container.require('app:core');
    const logger = container.require('app:logger');

    // catch 404 and forward to error handler
    router.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    router.use((err, req, res, next) => {
        logger.error(err);
        res.status(err.status || 500);

        const json = req.is('json') || req.xhr;
        if (json) {
            return res.json({
                success: false,
                error: err.message
            });
        }

        return res.render('error', {
            message: err.message,
            error: app.isProd ? {} : err
        });
    });

};