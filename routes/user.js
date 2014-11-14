'use strict';

/**
 * Page with my images
 */
exports.images = function(req, res) {
    var page = req.params.page || 1;
    res.render('index', { title: 'Page with my images on page ' + page});
};
