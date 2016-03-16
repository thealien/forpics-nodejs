'use strict';

module.exports = function (app, config, container) {
    const modules = {
        'app:core': "./express",
        'app:logger': "./logger",
        'app:models': "./models",
        'app:passport': "./passport",
        'image:validator': "./image-validator",
        'image:processor': "./image-processor"
    };

    Object.keys(modules).forEach(function (name) {
        container.define(name, require(modules[name])(app, config, container));
    });
};