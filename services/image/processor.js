'use strict';

const imagesize = require('image-size');
const async = require('async');
const fs = require('fs');
const gm = require('gm');
const utils = require('../../utils');

class Processor {

    constructor (config) {
        this.config = config;
        this.checkedDatePaths = {};
    }

    process (image, options, callback) {
        options = this.resolveOptions(options);
        const processor = this;
        const result = {
            originalfilename: image.originalname,
            size: image.size,
            width: image.width,
            height: image.height,
            psize: null,
            pwidth: null,
            pheight: null
        };
        const steps = [];
        const willBeModified = options.resize || options.rotate || options.normalize;

        let paths;
        let filename,
            targetImage,
            targetPreview,
            i;

        /*
         if (["image/jpeg", "image/pjpeg"].indexOf(image.mime) !== -1) {
         i.autoOrient();
         }
         */

        // 1. checkDestinationPaths
        steps.push(callback => {
            processor.checkDestinationPaths((error, destPaths) => {
                if (error) {
                    error = new Error('processor.check_storage.failed');
                } else {
                    paths = destPaths;
                    result.path_date = paths.dPath;
                    result.deleteGuid = utils.guid();
                    result.guid = generateFilename(10);
                    filename = `${result.guid}.${image.extension.toLowerCase()}`;
                    result.filename = filename;
                    targetImage = `${paths.image}/${filename}`;
                    targetPreview = `${paths.preview}/${filename}`;
                }
                callback(error);
            });
        });

        // 2. Copy main image
        steps.push(callback =>  fs.rename(image.path, targetImage, callback));

        // 3. Process main image
        if (willBeModified) {
            steps.push(callback => {
                i = gm(image.path);

                if (options.resize) {
                    let [width, height] = options.resize;
                    i.resize(width, height);
                }

                if (options.rotate) {
                    i.rotate(options.rotate);
                }

                if (options.normalize) {
                    i.normalize();
                }

                i.write(targetImage, callback);
            });
        }

        // 4. Make thumb
        if (options.preview) {
            steps.push(callback => {
                i = i || gm(targetImage);
                const [width, height] = options.preview;
                i.resize(width, height).write(targetPreview, callback);
            });
        }

        //5. Collect dimensions and sizes
        steps.push(function (callback) {
            const subSteps = [];
            if (willBeModified) {
                // get image new dimensions
                subSteps.push(callback => {
                    imagesize(targetImage, (error, dimensions) => {
                        result.width = dimensions.width;
                        result.height = dimensions.height;
                        callback(error);
                    });
                });
                // get image new size
                subSteps.push(callback => {
                    fs.stat(targetImage, (error, stats) => {
                        if (!error) {
                            result.size = stats.size;
                        }
                        callback(error);
                    });
                });
            }
            // get thumb dimensions
            subSteps.push(callback => {
                imagesize(targetPreview, (error, dimensions) => {
                    result.pwidth = dimensions.width;
                    result.pheight = dimensions.height;
                    callback(error);
                });
            });
            // get thumb new size
            subSteps.push(callback => {
                fs.stat(targetPreview, (error, stats) => {
                    if (!error) {
                        result.psize = stats.size;
                    }
                    callback(error);
                });
            });

            async.parallel(subSteps, callback);
        });

        async.series(steps, error => {
            if (error) {
                console.log(error);
                callback(error);
                fs.unlink(targetImage); // TODO error sometimes
                return;
            }
            callback(null, result);
        });
    }

    delete (image, callback) {
        const filename = image.filename;
        const datePath = image.path_date;
        const pathConfig = this.config.path;
        const iPath = `${pathConfig.image}/${datePath}`;
        const pPath = `${pathConfig.preview}/${datePath}`;

        async.parallel([
            callback => {
                fs.unlink(`${iPath}/${filename}`, callback);
            },
            function (callback) {
                fs.unlink(`${pPath}/${filename}`, callback);
            }
        ],callback);
    }

    resolveOptions (options = {}) {
        const config = this.config;
        const resolvedOptions = {};

        resolvedOptions.normalize = !!options.normalize;
        resolvedOptions.resize = config.resize[+options.resize] || null;
        resolvedOptions.rotate = config.rotate[+options.rotate] || null;
        resolvedOptions.preview = config.preview[+options.preview] || config.preview[3]; // default prev size

        return resolvedOptions;
    }

    checkDestinationPaths (callback) {
        const processor = this;
        const datePath = this.getDatePath();
        const pathConfig = this.config.path;

        const iPath = pathConfig.image + '/' + datePath;
        const pPath = pathConfig.preview + '/' + datePath;
        const result = {
            image: iPath,
            preview: pPath,
            dPath: datePath
        };

        if (this.checkedDatePaths[datePath]) {
            return callback(null, result);
        }

        async.parallel([
            callback => {
                fs.exists(iPath, exists => {
                    if (exists) {
                        return callback(null, true);
                    }
                    fs.mkdir(iPath, 0o644, callback);
                });
            },
            callback => {
                fs.exists(pPath, exists => {
                    if (exists) {
                        callback(null, true);
                    } else {
                        fs.mkdir(pPath, 0o644, callback);
                    }
                });
            }
        ], error => {
            processor.checkedDatePaths[datePath] = !error;
            callback(error, result);
        });
    }

    getDatePath () {
        var date = new Date(),
            path = ''+date.getFullYear() + ('0'+(date.getMonth()+1)+'').substr(-2) + ('0'+date.getDate()+'').substr(-2);
        return path;
    }

    static create (config) {
        return new Processor(config);
    }
}


function generateFilename(max){
    var guid = utils.guid();
    max = +max || guid.length;
    return guid.substr(0, utils.rand(7, max));
}

module.exports = Processor;