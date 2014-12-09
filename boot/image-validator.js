'use strict';

var Validator = require('../services/image/validator');

module.exports = function (app, config/*, container*/) {
    var validatorConfig = config.validation.image;

    return new Validator({
        maxWidth:validatorConfig.max_width,
        maxHeight:validatorConfig.max_height,
        maxSize:validatorConfig.max_size,
        allowedExt:validatorConfig.allowed_ext,
        allowedMime:validatorConfig.allowed_mime
    });
};