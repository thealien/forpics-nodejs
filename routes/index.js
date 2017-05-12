'use strict';

//const express = require('express');
//const router = express.Router();
//const Router = require('koa-router');
const routing = require('koa2-routing');
//const router = new Router();
const routes = {
    main:   require('./main'),
    //images: require('./images'),
    //admin:  require('./admin'),
    user:   require('./user'),
    //error:  require('./error')
};
/*
const regexParam = re => {
    return (req, res, next, val, name) =>{
        let captures;
        if ((captures = re.exec(String(val)))) {
            req.params[name] = captures[0];
            next();
        } else {
            next('route');
        }
    };
};
router.param('path_date', regexParam(/^[0-9]{8}$/));
router.param('guid', regexParam(/^\w+$/));
router.param('page', (req, res, next) => {
    req.params.page = Math.max(+req.params.page || 1, 1);
    next();
});
*/

module.exports = (app, config, container) => {
    app.use(routing(app));
    Object.keys(routes).forEach(name => routes[name](app, config, container));
    // app.use(router.routes(), router.allowedMethods());
};