'use strict';

var async =require('async'),
    fs = require('fs'),
    imagesize = require('image-size'),
    utils = require('../utils'),
    util = require('util'),
    models,
    uploadConfig,
    validator,
    processor;

var filesFieldname = 'uploadfile[]';

module.exports = function (router, config, container) {
    var app = container.require('app:core');
    models = container.require('app:models');
    uploadConfig = config.imageProcess;
    validator = container.require('image:validator');
    processor = container.require('image:processor');


    /**
     * Main page
     */
    router.get('/', function(req, res) {
        res.render('index', { title: 'Main page' });
    });


    /**
     * Upload from web | Upload from windows-client
     */
    router.post('/up', function(req, res) {
        handleUpload(req,  res, function (error, processedImages, rejectedImages) {
            // TODO
            console.log(error, processedImages, rejectedImages);
            var location;
            switch (processedImages.length) {
                case 0:
                    // nothing uploaded
                    location = 'MAIN_URL';
                    break;
                case 1:
                    // 1 image uploaded
                    location = 'URL_OF_IMAGE';
                    break;
                default:
                    // group of images uploaded
                    location = 'URL_OF_IMAGES_GROUP';
            }
            res.redirect(location);
        });
    });


    router.post('/upload', function(req, res) {
        handleUpload(req,  res, function (error, processedImages, rejectedImages) {
            var type;
            if (error) {
                res.status(500).send('Internal Server Error');
                return;
            }
            res.locals = app.locals;
            type = req.get('json') ? 'json' : 'xml';
            switch (type) {
                case 'json':
                    sendJsonResponse(res, error, processedImages, rejectedImages);
                    break;

                case 'xml':
                    sendXmlResponse(res, error, processedImages, rejectedImages);
                    break;

                default:
                    res.status(418).send("I'm a teapot");
                    break;
            }
        });
    });

};


//
// Helpers functions
//

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
        var group = utils.guid();
        async.each(acceptedImages, function (image, callback) {
            processor.process(image, options, function (error, result) {
                if (error) {
                    rejectedImages.push({
                        file: image,
                        error: error.message
                    });
                } else {
                    result.group = group;
                    processedImages.push(result);
                }
                callback();
            });
        }, callback);
    });

    // 4. Save results in DB
    steps.push(function (callback) {
        var meta = {
            ip: req.ip,
            userId: res.user ? res.user.id : 0,
            useragent: resolveUseragentId(req.get('User-Agent'))
        };
        async.each(processedImages, function (image, callback) {
            saveImageRecord(image,  meta, function (error) {
                if (error) {
                    console.error(error);
                }
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
 * @param {Object} meta
 * @param {Function} callback
 */
function saveImageRecord (data, meta, callback) {
    var image = models.Image.build({
        filename: data.filename,
        deleteGuid: data.deleteGuid,
        width: data.width,
        height: data.height,
        filesize: data.size,
        preview: !!data.psize,
        originalfilename: data.originalfilename,
        guid: data.guid,
        path_date: data.path_date,
        group: data.group,
        useragent: meta.useragent,
        ip: meta.ip,
        uploaduserid: meta.userId
    });
    image
        .save()
        .then(function (result) {
            callback(null, result);
        })
        .catch(callback);
}

function deleteRejectedImages (images) {
    images = images || [];
    images.forEach(function (image) {
        fs.unlink(image.file.path);
    });
}

function sendXmlResponse (res, error, processedImages, rejectedImages) {
    res.type('xml');
    res.render('images/view.xml.html', {
        layout: false,
        processedImages: processedImages,
        rejectedImages: rejectedImages
    });
}

function sendJsonResponse (res, error, processedImages, rejectedImages) {
    var result = [],
        locals = res.locals,
        baseUrl = locals.baseUrl,
        paths = locals.paths;

    (rejectedImages || []).forEach(function (image) {
        if (image.error) {
            result.push(image.error.message);
        }
    });

    (processedImages || []).forEach(function (image) {
        var item = {
            url: [baseUrl, paths.images, image.path_date, image.filename].join('/'),
            delurl: [baseUrl, 'delete', image.path_date, image.deleteGuid].join('/'),
            width: image.width,
            height: image.height,
            size: image.size,
            preview_url: image.psize ? [baseUrl, paths.previews, image.path_date, image.filename].join('/') : '',
            pwidth: image.pwidth || '',
            pheight: image.pheight || '',
            psize: image.psize || ''
        };

        result.push(item);
    });

    res.jsonp({
        files: result
    });
}

function resolveUseragentId (useragent) {
    var id = 0;
    useragent = useragent || '';
    if (useragent.indexOf('ForPicsUploader') !==-1 ) {
        id = 1;
    }
    return id;
}

