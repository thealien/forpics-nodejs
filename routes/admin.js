'use strict';

var express = require('express');
var router = express.Router();

/**
 * Page parameter
 */
router.param('page', function (req, res, next) {
    req.params.page = Math.max(+req.params.page || 1, 1);
    next();
});

/**
 * Admin page
 */
router.route('/admin/:page?')
    .post(function (res, req, next) {
        next();
    })
    .all(function(req, res) {
        var page = req.params.page;
        res.render('index', { title: 'admin on page '+ page });
    });

module.exports = router;