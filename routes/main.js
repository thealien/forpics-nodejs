'use strict';

var async =require('async'),
    validator = require('../services/image/validator').getInstance();

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
    var fieldName = 'uploadfile[]',
        files = req.files[fieldName] || [],
        errors = [];

    async.filter(files, function (image, callback) {
        validator.isValid(image, function (error, isValid) {
            if (!isValid) {
                errors.push({
                    file: image,
                    error: error.message
                });
            }
            callback(isValid);
        });
    }, function (error, images) {
        if (images.length) {
            processImages(images);
        } else {
            res.redirect('/');
        }
    });

    // TODO set flash messages (errors list)

    function processImages (images) {
        async.each(images, function (image, callback) {
            processImage(image, {}, function (error, result) {

            });
        }, function (error) {

        });
    }

};

/**
 * Upload from windows-client
 */
exports.upload = function(req, res) {

};

function checkFile (file) {
    // TODO
    // make file validation, mime, size, dimensions...
}

function resolveUploadOptions (req) {
    //var defaultOptions =
}

function processImage (image, options, callback) {
    // TODO process image ans store to /i path
    // make thumb and save to /p path
    // return result/error to callback
}

function saveImageRecord (data, callback) {
    // TODO save image data to DB,
    // return result/error to callback
}
