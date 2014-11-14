'use strict';

var express = require('express');
var router = express.Router();

/**
 * Main page
 */
router.get('/', function(req, res) {
  res.render('index', { title: 'Main page' });
});

/**
 * Upload from web
 */
router.get('/webupload', function(req, res) {
    res.render('index', { title: 'webupload' });
});

/**
 * Upload from windows-client
 */
router.get('/upload', function(req, res) {
    res.render('index', { title: 'upload' });
});


module.exports = router;
