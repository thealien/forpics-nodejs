'use strict';

/**
 * Main page
 */
exports.index = function(req, res) {
    res.render('index', { title: 'Main page' });
};

/**
 * Upload from web
 */
exports.webupload = function(req, res) {
    res.render('index', { title: 'webupload' });
};

/**
 * Upload from windows-client
 */
exports.upload = function(req, res) {
    res.render('index', { title: 'upload' });
};
