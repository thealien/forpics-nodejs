'use strict';

const path = require('path');
const render = require('koa-swig');
const co = require('co');
const viewHelpers = require('../../views/helpers');

module.exports = (app, config, container) => {
    const imageRouter = container.require('image:router');
    const messages = config.messages || {};

    const root = path.join(__dirname, '../../views');
    const cache = app.context.isProd ? 'memory' : false;
    const locals = {
        imageRouter,
        IS_PROD: app.isProd
    };
    const filters = {
        'tr': codename => messages[codename] || codename,
        'fileSize': viewHelpers.fileSize
    };

    app.context.render = co.wrap(render({
        root,
        cache,
        locals,
        filters,
        ext: 'html',
        writeBody: false
    }));

    app.use(async (ctx, next) => {
        if (!locals.baseUrl) {
            locals.baseUrl = ctx.request.origin;
        }
        await next();
    });
};