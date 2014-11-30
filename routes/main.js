'use strict';

var async =require('async'),
    fs = require('fs'),
    imagesize = require('image-size'),
    services = require('smallbox'),
    uploadConfig = services.require('app:config').imageProcess,
    validator = services.require('image:validator'),
    processor = services.require('image:processor');

var filesFieldname = 'uploadfile[]';

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
    handleUpload(req,  res, function (error, processedImages, rejectedImages) {
        // TODO
        console.log(error, processedImages, rejectedImages);
    });
};

/**
 * Upload from windows-client
 */
exports.upload = function(req, res) {
    handleUpload(req,  res, function (error, processedImages, rejectedImages) {
        // TODO
        console.log(error, processedImages, rejectedImages);
        res.send();
    });
};

function handleUpload (req, res, callback) {
    var receivedFiles = req.files[filesFieldname] || [],
        rejectedImages = [],
        acceptedImages = [],
        processedImages = [],
        steps = [];

    // 0. Normalize files array
    if (!(receivedFiles instanceof Array)) {
        receivedFiles = [receivedFiles];
    }

    // 1. Filter files by allowed dimensions
    steps.push(function (callback) {
        acceptedImages = receivedFiles.filter(function (image) {
            var error;
            if (image.truncated) {
                error = new Error('File truncated');
            }
            if (!error) {
                error = validator.validateImageFile(image);
            }
            if (error) {
                rejectedImages.push({
                    file: image,
                    error: error.message
                });
            }
            return !error;
        });
        callback();
    });

    // 2. Filter images by allowed size/type
    steps.push(function (callback) {
        async.filter(acceptedImages, function (image, callback) {
            getDimensions(image, function (error, dimensions) {
                if (!error) {
                    error = validator.validateDimensions(dimensions);
                }

                if (error) {
                    rejectedImages.push({
                        file: image,
                        error: error.message
                    });
                } else {
                    image.width = dimensions.width;
                    image.height = dimensions.height;
                }

                callback(!error);
            });
        }, function (images) {
            acceptedImages = images || [];
            callback();
        });
    });

    // 3. Process images
    steps.push(function (callback) {
        var options = resolveUploadOptions(req);
        async.each(acceptedImages, function (image, callback) {
            processor.process(image, options, function (error, result) {
                if (error) {
                    rejectedImages.push({
                        file: image,
                        error: error.message
                    });
                } else {
                    processedImages.push(result);
                }
                callback();
            });
        }, callback);
    });

    // 4. Save results in DB
    steps.push(function (callback) {
        async.each(processedImages, function (image, callback) {
            saveImageRecord(imagesize,  function (error, callback) {
                callback(); // continue in any way
            });
        }, callback);
    });

    // 5. Remove tmp files, return results
    async.series(steps, function (error) {
        deleteRejectedImages(rejectedImages);
        callback(error, processedImages, rejectedImages);
    });
}

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

function deleteRejectedImages (images) {
    images = images || [];
    images.forEach(function (image) {
        fs.unlink(image.file.path);
    });
}
