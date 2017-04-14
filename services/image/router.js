'use strict';

class Router {

    constructor ({paths}) {
        this.paths = paths;
    }

    /**
     *
     * @param {Object} image
     * @param {String} [baseUrl]
     * @returns {String}
     */
    resolveImageUrl (image, baseUrl = '') {
        return baseUrl + this.resolveImageBaseUrl(image);
    }

    /**
     *
     * @param {Object} image
     * @returns {String}
     */
    resolveImageBaseUrl (image) {
        return `/${this.paths.images}/${image.path_date}/${image.filename}`;
    }

    /**
     *
     * @param {Object} image
     * @param {String} [baseUrl]
     * @returns {String}
     */
    resolvePreviewUrl (image, baseUrl = '') {
        return baseUrl + this.resolvePreviewBaseUrl(image);
    }

    /**
     *
     * @param {Object} image
     * @returns {String}
     */
    resolvePreviewBaseUrl (image) {
        return `/${this.paths.previews}/${image.path_date}/${image.filename}`;
    }

    /**
     *
     * @param {Object} image
     * @param {String} [baseUrl]
     * @returns {String}
     */
    resolveGroupPageUrl (image, baseUrl = '') {
        return baseUrl + this.resolveGroupPageBaseUrl(image);
    }

    resolveGroupPageBaseUrl (image) {
        return `/images/${image.path_date}/${image.group}`;
    }

    resolveDeletePageUrl (image, baseUrl = '') {
        return baseUrl + this.resolveDeletePageBaseUrl(image);
    }

    resolveDeletePageBaseUrl (image) {
        return `/delete/${image.path_date}/${image.deleteGuid}`;
    }

}

module.exports = Router;