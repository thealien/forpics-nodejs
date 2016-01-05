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

var regexParam = function (re) {
    return function(req, res, next, val, name){
        var captures;
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
    app.use(router);

};