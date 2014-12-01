'use strict';

var express = require('express');
var router = express.Router();
var routes = {
    main:   require('./main'),
    images: require('./images'),
    admin:  require('./admin'),
    user:   require('./user')
};

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

// -------
// Routes
// -------

/**
 * Main page
 */
router.get('/', routes.main.index);

/**
 * Upload from web
 */
//router.post('/up', routes.main.webupload);// TODO

/**
 * Upload from windows-client
 */
router.post('/upload', routes.main.upload);
router.post('/up', routes.main.upload);

router.param('path_date', /^[0-9]{8}$/);
router.param('guid', /^\w+$/);
router.param('page', function (req, res, next) {
    console.log(req.params.page);
    req.params.page = Math.max(+req.params.page || 1, 1);
    next();
});

/**
 * Page with image
 */
router.get('/image/:path_date/:guid', routes.images.image_single);

/**
 * Page with images group
 */
router.get('/images/:path_date/:guid', routes.images.images_group);

/**
 * Delete image
 */
router.route('/delete/:path_date/:guid')
    .post(routes.images.delete_image_handler)
    .get(routes.images.delete_image);

/**
 * Admin page
 */
router.route('/admin/:page?')
    .post(routes.admin.action)
    .get(routes.admin.images);

/**
 * Registration page
 */
router.route('/user/register')
    .all(routes.user.register);

/**
 * Login page
 */
router.route('/user/login')
    .all(routes.user.login);

/**
 * Page with my images
 */
router.get('/my/:page?', routes.user.images);


module.exports = router;