'use strict';

var imagesize = require('image-size'),
    instance = null;

function Validator (options) {
    this.maxHeight = options.maxHeight || this.maxHeight;
    this.maxWidth = options.maxWidth || this.maxWidth;
    this.maxSize = options.maxSize || this.maxSize;
    this.allowedExt = options.allowedExt || this.allowedExt;
    this.allowedMime = options.allowedMime || this.allowedMime;
}

Validator.prototype.maxHeight = 10000;
Validator.prototype.maxWidth = 10000;
Validator.prototype.maxSize = 10000;
Validator.prototype.allowedExt = [
    "jpg", "jpeg", "gif", "png"
];
Validator.prototype.allowedMime = [
    "image/jpeg", "image/pjpeg", "image/png", "image/x-png", "image/gif"
];

Validator.prototype.isValid = function (image, callback) {
    var error = null,
        validator = this;

    if (image.size > this.maxSize) {
        error = new Error('validation.error.filesize_too_large');
    } else if (this.allowedExt.indexOf((image.extension+'').toLowerCase()) === -1) {
        error = new Error('validation.error.unsupported_image_type');
    } else if (this.allowedMime.indexOf((image.mimetype+'').toLowerCase()) === -1) {
        error = new Error('validation.error.unsupported_image_type');
    }

    if (error) {
        callback(error, false);
        return;
    }

    imagesize(image.path, function (error, dimensions) {
        if (error) {
            error = new Error('validation.error.get_dimensions_failed');
        } else if (dimensions.width > validator.maxWidth) {
            error = new Error('validation.error.width_too_large');
        } else if (dimensions.height > validator.maxHeight) {
            error = new Error('validation.error.height_too_large');
        }
        callback(error, !error);
    });

};

exports.init = function (options) {
    instance = new Validator(options);
    return instance;
};

exports.getInstance = function () {
    return instance;
};