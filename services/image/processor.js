'use strict';

var imagesize = require('image-size'),
    async = require('async'),
    fs = require('fs'),
    util = require('util'),
    gm = require('gm');

function Processor (config) {
    this.config = config;
    this.checkedDatePaths = {};
}

Processor.prototype.process = function (image, options, callback) {
    options = this.resolveOptions(options);
    var processor = this,
        result = {
            originalfilename: image.originalname,
            size: image.size,
            width: image.width,
            height: image.height,
            psize: null,
            pwidth: null,
            pheight: null
        },
        steps = [],
        paths;

    var willBeModified = options.resize || options.rotate || options.normalize,
        filename,
        targetImage,
        targetPreview,
        i;

    /*
     if (["image/jpeg", "image/pjpeg"].indexOf(image.mime) !== -1) {
     i.autoOrient();
     }
     */

    // 1. checkDestinationPaths
    steps.push(function (callback) {
        processor.checkDestinationPaths(function (error, _paths) {
            if (error) {
                error = new Error('processor.check_storage.failed');
            } else {
                paths = _paths;
                result.path_date = paths.dPath;
                filename = util.format('%s.%s', generateFilename(10), image.extension);
                result.filename = filename;
                targetImage = paths.image + '/' + filename;
                targetPreview = paths.preview + '/' + filename;
            }
            callback(error);
        });
    });

    // 2. Copy main image
    steps.push(function (callback) {
        fs.rename(image.path, targetImage, callback);
    });

    // 3. Process main image
    if (willBeModified) {
        steps.push(function (callback) {
            i = gm(image.path);
            if (options.resize) {
                i.resize(options.resize[0], options.resize.height[1]);
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
        steps.push(function (callback) {
            i = i || gm(targetImage);
            i.resize(options.preview[0], options.preview[1])
             .write(targetPreview, callback);
        });
    }

    //5. Collect dimensions and sizes
    steps.push(function (callback) {
        var steps = [];
        if (willBeModified) {
            // get image new dimensions
            steps.push(function (callback) {
                imagesize(targetImage, function (error, dimensions) {
                    result.width = dimensions.width;
                    result.height = dimensions.height;
                    callback(error);
                });
            });
            // get image new size
            steps.push(function (callback) {
                fs.stat(targetImage, function (error, stats) {
                    if (!error) {
                        result.size = stats.size;
                    }
                    callback(error);
                });
            });
        }
        // get thumb dimensions
        steps.push(function (callback) {
            imagesize(targetPreview, function (error, dimensions) {
                result.pwidth = dimensions.width;
                result.pheight = dimensions.height;
                callback(error);
            });
        });
        // get thumb new size
        steps.push(function (callback) {
            fs.stat(targetPreview, function (error, stats) {
                if (!error) {
                    result.psize = stats.size;
                }
                callback(error);
            });
        });

        async.parallel(steps, callback);
    });

    async.series(steps, function (error, results) {
        if (error) {
            callback(error);
            fs.unlink(targetImage);
            return;
        }
        result.deleteGuid = guid();
        callback(null, result);
    });
};

/**
 *
 * @param {Object} options
 * @return {Object}
 */
Processor.prototype.resolveOptions = function (options) {
    var config = this.config,
        resolvedOptions = {};

    options = options || {};

    resolvedOptions.normalize = !!options.normalize;
    resolvedOptions.resize = config.resize[+options.resize] || null;
    resolvedOptions.rotate = config.rotate[+options.rotate] || null;
    resolvedOptions.preview = config.preview[+options.preview] || config.preview[2];

    return resolvedOptions;
};

Processor.prototype.checkDestinationPaths = function (callback) {
    var processor = this,
        datePath = this.getDatePath(),
        iPath, pPath,
        pathConfig = this.config.path,
        result;

    iPath = pathConfig.image + '/' + datePath;
    pPath = pathConfig.preview + '/' + datePath;
    result = {image: iPath, preview: pPath, dPath: datePath};

    if (this.checkedDatePaths[datePath]) {
        callback(null, result);
        return;
    }

    async.parallel([function (callback) {
        fs.exists(iPath, function (exists) {
            if (exists) {
                callback(null, true);
            } else {
                fs.mkdir(iPath, callback); // TODO set 0644 perm
            }
        });
    }, function (callback) {
        fs.exists(pPath, function (exists) {
            if (exists) {
                callback(null, true);
            } else {
                fs.mkdir(pPath, callback); // TODO set 0644 perm
            }
        });
    }],function (error/*, result*/) {
        processor.checkedDatePaths[datePath] = !error;
        callback(error, result);
    });
};

Processor.prototype.getDatePath = function () {
    var date = new Date(),
        path = ''+date.getFullYear() + (date.getMonth()+1) + date.getDate();
    return path;
};

function collectResult (image, callback) {
    var result = {};


    // TODO
    // image.image
    // image.preview
}

function generateFilename(max){
    var g = guid();
    max = +max || g.length;
    return g.substr(0, rand(7, max));
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4()+s4()+s4()+s4();
    };
})();


exports.Processor = Processor;

exports.create = function (config) {
    return new Processor(config);
};