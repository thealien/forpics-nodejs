'use strict';

var express = require('express');
var router = express.Router();

// TODO
router.param('path_date', /^[0-9]{8}$/);
router.param('guid', /^\w+$/);

/**
 * Page with image
 */
router.get('/image/:path_date/:guid', function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('index', { title: 'Page with image ' + path_date + '/' +  guid});
});

/**
 * Page with images group
 */
router.get('/images/:path_date/:guid', function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('index', { title: 'Page with images group ' + path_date + '/' +  guid });
});

/**
 * Delete image
 */
router.route('/delete/:path_date/:guid')
    .post(function (res, req) {

    })
    .get(function(req, res) {
        var params = req.params,
            path_date = params.path_date,
            guid = params.guid;
        res.render('index', { title: 'Delete image ' + path_date + '/' +  guid});
    });

module.exports = router;