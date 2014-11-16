'use strict';

var async =require('async');

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
        images,
        errors = [];

    console.log(files);
    return true;
    images = files.map(function (file) {
        var isValid = checkFile(file),
            imageIsOk = (isValid === true);

        if (!imageIsOk) {
            errors.push({
                file: file,
                error: isValid
            });
        }

        return imageIsOk;
    });

    // TODO set flash messages (errors list)

    if (!images.length) {
        res.redirect('/');
        return;
    }

    async.each(images, function (image, callback) {
        processImage(image, {}, function (error, result) {

        });
    }, function (error) {

    });

    images.forEach(function (image) {

    });

    res.send('ok');
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

function processImage (image, options, callback) {
    // TODO process image ans store to /i path
    // make thumb and save to /p path
    // return result/error to callback
}

function saveImageRecord (data, callback) {
    // TODO save image data to DB,
    // return result/error to callback
}
