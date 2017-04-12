'use strict';

module.exports = (app, config, container) => {
    const modules = {
        'app:core': "./express",
        'app:logger': "./logger",
        'app:models': "./models",
        'app:passport': "./passport",
        'image:validator': "./image-validator",
        'image:processor': "./image-processor"
    };

    Object.keys(modules).forEach(name => {
        const module = require(modules[name])(app, config, container);
        container.define(name, module);
    });
};