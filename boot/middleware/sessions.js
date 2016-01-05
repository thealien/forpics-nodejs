var session         = require('express-session');
var FileStore       = require('session-file-store')(session);

module.exports = function (app, config) {

    var sessionConfig = config.app.session;

    app.use(session({
        secret: sessionConfig.secret,
        store: new FileStore({
            path: './runtime/sessions',
            encrypt: true
        }),
        cookie: sessionConfig.cookie,
        resave: false, // TODO check docs
        saveUninitialized: false // TODO check docs
    }));

};