'use strict';

module.exports = (router, config, container) => {
    const {isProd} = container.require('app:core');
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

        const message = err.expose || !isProd ? err.message : 'Internal Server Error';
        if (json) {
            return res.json({
                success: false,
                error: message
            });
        }

        return res.render('error', {
            message: message,
            error: isProd ? {} : err
        });
    });

};