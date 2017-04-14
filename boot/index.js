'use strict';

module.exports = (app, config, container) => {
    const modules = {
        'app:logger': "./logger",
        'app:models': "./models",
        'app:passport': "./passport",
        'image:validator': "./image-validator",
        'image:processor': "./image-processor",
        'image:router': "./image-router",
        'app:core': "./express"
    };

    Object.keys(modules).forEach(name => {
        const module = require(modules[name])(app, config, container);
        container.define(name, module);
    });
};