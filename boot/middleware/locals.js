'use strict';

module.exports = (app, config, container) => {
    const imageRouter = container.require('image:router');
    const {paths} = config.app;
    const {locals} = app;

    Object.assign(locals, {
        imageRouter,
        paths,
        IS_PROD: app.isProd,
        currentYear: new Date().getFullYear()
    });

    app.use((req, res, next) => {
        if (!locals.baseUrl) {
            locals.baseUrl = `${req.protocol}://${req.headers.host}`;
        }
        next();
    });
};