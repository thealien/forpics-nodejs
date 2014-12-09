'use strict';
var express = require('express');
var router = express.Router();
var routes = {
    main:   require('./main'),
    images: require('./images'),
    admin:  require('./admin'),
    user:   require('./user'),
    error:  require('./error')
};

// param handlers
router.param(function(name, fn){
    var res;
    if (fn instanceof RegExp) {
        res = function(req, res, next, val){
            var captures;
            if ((captures = fn.exec(String(val)))) {
                req.params[name] = captures;
                next();
            } else {
                next('route');
            }
        };
    }
    return res;
});
router.param('path_date', /^[0-9]{8}$/);
router.param('guid', /^\w+$/);
router.param('page', function (req, res, next) {
    req.params.page = Math.max(+req.params.page || 1, 1);
    next();
});

module.exports = function (app, config, container) {
    routes.main(router, config, container);
    routes.images(router, config, container);
    routes.admin(router, config, container);
    routes.user(router, config, container);
    routes.error(router, config, container);
};