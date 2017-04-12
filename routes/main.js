'use strict';

const async =require('async');
const fs = require('fs');
const imagesize = require('image-size');
const path = require('path');

const utils = require('../utils');

let filesFieldname;

let models,
    uploadConfig,
    validator,
    processor;

module.exports = (router, config, container) => {
    const app = container.require('app:core');
    models = container.require('app:models');
    validator = container.require('image:validator');
    processor = container.require('image:processor');
    uploadConfig = config.imageProcess;
    filesFieldname = config.app.filesFormField;

    /**
     * Main page
     */
    router.get('/', (req, res) => {
        res.render('main/index', {
            title: 'Main page',
            messages: req.flash()
        });
    });

    /**
     * Upload from web | Upload from windows-client
     */
    router.post('/up', (req, res) => {
        handleUpload(req, (error, processedImages = [], rejectedImages = []) => {
            if (rejectedImages.length) {
                req.flash('rejectedImages', rejectedImages);
            }

            let location,
                firstImage;

            switch (processedImages.length) {
                case 0:
                    // nothing uploaded
                    location = '/';
                    break;
                case 1:
                    // 1 image uploaded
                    firstImage = processedImages[0];
                    location = `/image/${firstImage.path_date}/${firstImage.guid}`;
                    break;
                default:
                    // group of images uploaded
                    firstImage = processedImages[0];
                    location = `/images/${firstImage.path_date}/${firstImage.group}`;
            }
            res.redirect(location);
        });
    });


    router.post('/upload', (req, res) => {
        handleUpload(req, (error, processedImages = [], rejectedImages = []) => {
            if (error) {
                return res.status(500).send('Internal Server Error');
            }
            res.locals = app.locals;

            const type = req.get('json') ? 'json' : 'xml';
            const responseFns = {
                json: sendJsonResponse,
                xml: sendXmlResponse
            };

            const responseFn = responseFns[type];
            if (!responseFn) {
                return res.status(418).send("I'm a teapot");
            }

            responseFn(res, processedImages, rejectedImages);
        });
    });

};


//
// Helpers functions
//

function handleUpload (req, callback) {
    const receivedFiles = [].concat(req.files[filesFieldname]);
    let rejectedImages = [],
        acceptedImages = [],
        processedImages = [],
        steps = [];

    // 1. Filter files by allowed dimensions
    steps.push(callback => {
        acceptedImages = receivedFiles.filter(image => {
            image.extension = image.extension || getExtension(image.originalname);

            let error;
            if (image.truncated) {
                error = new Error('File truncated');
            } else {
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
    steps.push(callback => {
        async.filter(acceptedImages, (image, callback) => {
            getDimensions(image.path, (error, dimensions) => {
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
        }, images => {
            acceptedImages = images;
            callback();
        });
    });

    // 3. Process images
    steps.push(callback => {
        const options = resolveUploadOptions(req);
        const groupGuid = utils.guid();

        async.each(acceptedImages, (image, callback) => {
            processor.process(image, options, (error, result) => {
                if (error) {
                    rejectedImages.push({
                        file: image,
                        error: error.message
                    });
                } else {
                    result.group = groupGuid;
                    processedImages.push(result);
                }
                callback();
            });
        }, callback);
    });

    // 4. Save results in DB
    steps.push(callback => {
        const meta = {
            ip: req.ip,
            userId: req.user ? req.user.userID : 0,
            useragent: resolveUseragentId(req.get('User-Agent'))
        };

        async.each(processedImages, (image, callback) => {
            saveImageRecord(image,  meta, error => {
                if (error) {
                    console.error(error);
                }
                callback(); // continue in any way
            });
        }, callback);
    });

    // 5. Remove tmp files, return results
    async.series(steps, error => {
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
    const params = req.body || {};
    return {
        resize: uploadConfig.resize[+params.resize] || null,
        rotate: uploadConfig.rotate[+params.rotate] || null,
        preview: uploadConfig.preview[+params.preview] || null,
        normalize: !!params.normalize
    };
}

/**
 *
 * @param {String} imagePath
 * @param {Function} callback
 */
function getDimensions (imagePath, callback) {
    imagesize(imagePath, callback);
}

/**
 *
 * @param {Object} data
 * @param {Object} meta
 * @param {Function} callback
 */
function saveImageRecord (data, meta, callback) {
    const image = models.Image.build({
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

function deleteRejectedImages (images = []) {
    images.forEach(image => fs.unlink(image.file.path));
}

function sendXmlResponse (res, processedImages, rejectedImages) {
    res.type('xml');
    res.render('images/view.xml.html', {
        layout: false,
        processedImages: processedImages,
        rejectedImages: rejectedImages
    });
}

function sendJsonResponse (res, processedImages = [], rejectedImages = []) {
    const {baseUrl, paths} = res.locals;
    const result = [];

    rejectedImages.forEach(image => {
        if (image.error) {
            result.push(image.error.message);
        }
    });

    processedImages.forEach(image => {
        result.push({
            url: `${baseUrl}/${paths.images}/${image.path_date}/${image.filename}`,
            delurl: `${baseUrl}/delete/${image.path_date}/${image.deleteGuid}`,
            width: image.width,
            height: image.height,
            size: image.size,
            preview_url: image.psize ? `${baseUrl}/${paths.previews}/${image.path_date}/${image.filename}` : '',
            pwidth: image.pwidth || '',
            pheight: image.pheight || '',
            psize: image.psize || ''
        });
    });

    res.jsonp({
        files: result
    });
}

function resolveUseragentId (useragent = '') {
    return String(useragent).indexOf('ForPicsUploader') !==-1  ? 1 : 0;
}

function getExtension (filename) {
    return path.extname(filename).replace(/^\./, '');
}

