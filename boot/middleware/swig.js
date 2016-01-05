var path            = require('path');
var swig            = require('swig');
var viewHelpers     = require('../../views/helpers');

module.exports = function (app, config) {

    swig.setFilter('fileSize', viewHelpers.fileSize);
    swig.setDefaults({ cache: false });
    app.engine('html', swig.renderFile);
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'html');

};