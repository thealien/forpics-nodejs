'use strict';

var async =require('async'),
    fs = require('fs'),
    imagesize = require('image-size'),
    services = require('smallbox'),
    uploadConfig = services.require('app:config').imageProcess,
    validator = services.require('image:validator'),
    processor = services.require('image:processor');

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
        results = [],
        errors = [];

    // Normalize files array
    if (!(files instanceof Array)) {
        files = [files];
    }

    // Filter images files by allowed size/type
    images = files.filter(function (image) {
        var error = validator.validateImageFile(image);
        if (error) {
            errors.push({
                file: image,
                error: error.message
            });
        }
        return !error;
    });

    async.filter(images, function (image, callback) {
        /**
         { fieldname: 'uploadfile[]',
           originalname: 'Буфер обмена-1.jpg',
           name: '63578fe9c0c98e74d06203d5de803bbd.jpg',
           encoding: '7bit',
           mimetype: 'image/jpeg',
           path: 'uploads/63578fe9c0c98e74d06203d5de803bbd.jpg',
           extension: 'jpg',
           size: 135956,
           truncated: false,
           buffer: null }
         */
        getDimensions(image, function (error, dimensions) {
            if (!error) {
                error = validator.validateDimensions(dimensions);
            }
            if (error) {
                errors.push({
                    file: image,
                    error: error.message
                });
                return callback(false);
            }

            image.width = dimensions.width;
            image.height = dimensions.height;

            callback(true);
        });
    }, function (images) {
        if (images.length) {
            processImages(images);
        } else {
            // TODO set flash messages (errors list)
            deleteFiles(files);
            res.redirect('/');
        }
    });

    function processImages (images) {
        var options = resolveUploadOptions(req);
        async.each(images, function (image, callback) {
            processor.process(image, options, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    results.push(result);
                    /*
                    console.log('Processed image:');
                    console.log(result);
                    saveImageRecord(result, function (error, data) {
                        if (!error) {
                            console.log(data);
                        } else {
                            console.log(error);
                        }
                    });*/
                }
                callback();
            });
        }, function (error) {
            // TODO
            deleteFiles(files);
            res.send({results: results, errors: errors});
            // TODO
        });
    }

};

/**
 * Upload from windows-client
 */
exports.upload = function(req, res) {
    // TODO
};

/**
 *
 * @param {Object} req
 * @return {Object}
 */
function resolveUploadOptions (req) {
    var params = req.body || {},
        options = {};

    options.normalize = !!params.normalize;
    options.resize = uploadConfig.resize[+params.resize] || null;
    options.rotate = uploadConfig.rotate[+params.rotate] || null;
    options.preview = uploadConfig.preview[+params.preview] || null;

    return options;
}

/**
 *
 * @param {Object} image
 * @param {Function} callback
 */
function getDimensions (image, callback) {
    imagesize(image.path, callback);
}

/**
 *
 * @param {Object} data
 * @param {Function} callback
 */
function saveImageRecord (data, callback) {
    // TODO save image data to DB,
    // return result/error to callback
}

function deleteFiles (files) {
    files = files || [];
    files.forEach(function (file) {
        fs.unlink(file.path);
    });
}
