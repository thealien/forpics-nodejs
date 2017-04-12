'use strict';

const maxHeight = 10000;
const maxWidth = 10000;
const maxSize = 10*1024*1024;
const allowedExt = [
    "jpg", "jpeg", "gif", "png"
];
const allowedMime = [
    "image/jpeg", "image/pjpeg", "image/png", "image/x-png", "image/gif"
];

class Validator {

    constructor (options) {
        this.maxHeight = options.maxHeight || maxHeight;
        this.maxWidth = options.maxWidth || maxWidth;
        this.maxSize = options.maxSize || maxSize;
        this.allowedExt = options.allowedExt || allowedExt;
        this.allowedMime = options.allowedMime || allowedMime;
    }

    validateImageFile (image) {
        var error = null;

        if (image.size > this.maxSize) {
            error = new Error('validation.error.filesize_too_large');
        } else if (this.allowedExt.indexOf((image.extension+'').toLowerCase()) === -1) {
            error = new Error('validation.error.unsupported_image_type');
        } else if (this.allowedMime.indexOf((image.mimetype+'').toLowerCase()) === -1) {
            error = new Error('validation.error.unsupported_image_type');
        }

        return error;
    }

    validateDimensions ({width, height}) {
        var error = null;

        if (width > this.maxWidth) {
            error = new Error('validation.error.width_too_large');
        } else if (height > this.maxHeight) {
            error = new Error('validation.error.height_too_large');
        }

        return error;
    }

}

module.exports = Validator;