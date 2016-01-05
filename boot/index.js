'use strict';

module.exports = function (app, config, container) {
    container.define('app:core', require("./express")(app, config, container));
    container.define('app:logger', require("./logger")(app, config, container));
    container.define('app:models', require("./models")(app, config, container));
    container.define('app:passport', require("./passport")(app, config, container));
    container.define('image:validator', require("./image-validator")(app, config, container));
    container.define('image:processor', require("./image-processor")(app, config, container));
};