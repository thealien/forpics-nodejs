module.exports = function (app, config) {

    app.locals.paths = config.app.paths;
    app.locals.IS_PROD = app.isProd;

    app.use(function (req, res, next) {
        if (!app.locals.baseUrl) {
            app.locals.baseUrl = req.protocol + '://' + req.headers.host;
        }
        next();
    });
};