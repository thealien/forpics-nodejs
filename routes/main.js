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
    var receivedFiles = req.files[filesFieldname] || [],
        acceptedImages,
        results = [],
        errors = [],
        steps = [];

    // 1. Normalize files array
    if (!(receivedFiles instanceof Array)) {
        receivedFiles = [receivedFiles];
    }

    // Filter files by allowed dimensions
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
                errors.push({
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
                    errors.push({
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

    // 4. Process images

    steps.push(function (callback) {
        var options = resolveUploadOptions(req);
        async.each(acceptedImages, function (image, callback) {
            processor.process(image, options, function (error, result) {
                if (error) {
                    errors.push({
                        file: image,
                        error: error.message
                    });
                }

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
            deleteFiles(receivedFiles);
            res.send({results: results, errors: errors});
            // TODO
        });

        // TODO
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
            deleteFiles(receivedFiles);
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
