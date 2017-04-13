'use strict';

const viewHelpers = require('../../views/helpers');

const MAX_HEIGHT = 10000;
const MAX_WIDTH = 10000;
const MAX_SIZE = 10*1024*1024;
const MAX_SIZE_TEXT = viewHelpers.fileSize(MAX_SIZE);
const ALLOWED_EXT = [
    "jpg", "jpeg", "gif", "png"
];
const ALLOWED_MIME = [
    "image/jpeg", "image/pjpeg", "image/png", "image/x-png", "image/gif"
];

class Validator {

    constructor (options) {
        this.maxHeight = options.maxHeight || MAX_HEIGHT;
        this.maxWidth = options.maxWidth || MAX_WIDTH;
        this.maxSize = options.maxSize || MAX_SIZE;
        this.allowedExt = options.allowedExt || ALLOWED_EXT;
        this.allowedMime = options.allowedMime || ALLOWED_MIME;
    }

    validateImageFile ({size, extension, mimetype}) {
        if (size > this.maxSize) {
            return new Error(`Размер файла превышает ${MAX_SIZE_TEXT}`);
        }

        if (!this.isAllowedExtension(extension)) {
            return new Error('Неподдерживаемый тип файла');
        }

        if (!this.isAllowedMimetype(mimetype)) {
            return new Error('Неподдерживаемый тип файла (mime)');
        }

        return null;
    }

    isAllowedExtension (ext) {
        return this.allowedExt.includes(String(ext).toLowerCase());
    }

    isAllowedMimetype (mimetype) {
        return this.allowedMime.includes(String(mimetype).toLowerCase());
    }

    validateDimensions ({width, height}) {
        if (width > this.maxWidth) {
            return new Error(`Ширина изображения превышает ${this.maxWidth}px`);
        }

        if (height > this.maxHeight) {
            return new Error(`Высота изображения превышает ${this.maxHeight}px`);
        }

        return null;
    }

}

module.exports = Validator;