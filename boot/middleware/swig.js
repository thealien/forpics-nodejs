'use strict';

const path = require('path');
const swig = require('swig-templates');
const viewHelpers = require('../../views/helpers');

module.exports = (app, config) => {
    const messages = config.messages || {};

    swig.setFilter('fileSize', viewHelpers.fileSize);
    swig.setFilter('tr', codename => messages[codename] || codename);
    swig.setDefaults({cache: false});

    app.engine('html', swig.renderFile);

    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'html');
};