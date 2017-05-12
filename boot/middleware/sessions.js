'use strict';

const session = require('koa-session-minimal');
const FileStore = require("koa-generic-session-file");

module.exports = (app, config) => {
    const sessionConfig = config.app.session;
    const store = new FileStore({
        sessionDirectory: sessionConfig.directory
    });

    app.keys = [sessionConfig.secret];
    app.use(session({
        key: 'connect.sid',
        cookie: sessionConfig.cookie,
        store
    }));
};