'use strict';

const async =require('async');
const fs = require('fs');
const imagesize = require('image-size');
const path = require('path');
const multer = require('multer');

const utils = require('../utils');

module.exports = (router, config, container) => {
    const app = container.require('app:core');
    const validator = container.require('image:validator');
    const processor = container.require('image:processor');
    const imageRouter = container.require('image:router');
    const {Image} = container.require('app:models');
    const uploadConfig = config.imageProcess;

    const {filesFormField} = config.app;
    const uploadFilesHandler = multer(Object.assign({
            fileFilter: (req, file, cb) => {
                const ext = getExtension(file.originalname);
                const accepted = validator.isAllowedExtension(String(ext).toLowerCase());
                cb(null, accepted);
            }
        }, config.multer
    )).fields([{
        name: filesFormField
    }]);

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
    router.post('/up', uploadFilesHandler, (req, res) => {
        handleUpload(req, (error, processedImages = [], rejectedImages = []) => {
            if (rejectedImages.length) {
                req.flash('rejectedImages', rejectedImages);
            }

            const processedCount = processedImages.length;
            const [firstImage] = processedImages;

            let location = '/';

            if (processedCount === 1) {
                // 1 image uploaded
                location = imageRouter.resolveImagePageUrl(firstImage);
            } else if (processedCount > 1) {
                // group of images uploaded
                location = imageRouter.resolveGroupPageUrl(firstImage);
            }

            res.redirect(location);
        });
    });


    router.post('/upload', uploadFilesHandler, (req, res, next) => {
        handleUpload(req, (error, processedImages = [], rejectedImages = []) => {
            if (error) {
                return next(error);
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


    //
    // Helpers functions
    //

    function handleUpload (req, callback) {
        const receivedFiles = [].concat(req.files[filesFormField]);
        const rejectedImages = [];
        const processedImages = [];
        const steps = [];
        let acceptedImages = [];

        // 1. Filter files by allowed dimensions
        steps.push(callback => {
            acceptedImages = receivedFiles.filter(image => {
                image.extension = image.extension || getExtension(image.originalname);

                let error;
                if (image.truncated) {
                    error = new Error('Файл загружен не полностью');
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
            preview: uploadConfig.preview[+params.preview] || uploadConfig.preview[4],
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
        const image = Image.build({
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
        const result = [];

        rejectedImages.forEach(image => {
            if (image.error) {
                result.push(image.error.message);
            }
        });

        const {baseUrl} = res.locals;
        processedImages.forEach(image => {
            const {width, height, size, pwidth, pheight, psize} = image;
            result.push({
                url: imageRouter.resolveImageUrl(image, baseUrl),
                delurl: imageRouter.resolveDeletePageUrl(image, baseUrl),
                preview_url: psize ?  imageRouter.resolveImagePreviewUrl(image, baseUrl) : '',
                width, height, size,
                pwidth, pheight, psize
            });
        });

        res.jsonp({
            files: result
        });
    }

    function resolveUseragentId (useragent = '') {
        return String(useragent).indexOf('ForPicsUploader') !== -1 ? 1 : 0;
    }

    function getExtension (filename) {
        return path.extname(String(filename)).replace(/^\./, '');
    }

};


