'use strict';

var express = require('express');
var router = express.Router();

/**
 * Page with my images
 */
router.get('/my/:page?', function(req, res) {
    var page = Math.max(+req.params.page || 1, 1);
    res.render('index', { title: 'Page with my images on page ' + page});
});

module.exports = router;
