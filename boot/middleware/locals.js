'use strict';

module.exports = (app, config) => {
    const locals = app.locals;

    locals.paths = config.app.paths;
    locals.IS_PROD = app.isProd;

    app.use((req, res, next) => {
        if (!locals.baseUrl) {
            locals.baseUrl = `${req.protocol}://${req.headers.host}`;
        }
        next();
    });
};