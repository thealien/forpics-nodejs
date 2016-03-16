const path            = require('path');
const swig            = require('swig');
const viewHelpers     = require('../../views/helpers');

module.exports = function (app, config) {

    const messages = config.messages || {};

    swig.setFilter('fileSize', viewHelpers.fileSize);

    swig.setFilter('tr', function (codename) {
        return (codename in messages) ? messages[codename] : messages;
    });

    swig.setDefaults({ cache: false });
    app.engine('html', swig.renderFile);
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'html');

};