'use strict';

exports.register = function(req, res) {
    res.render('user/register', {

    });
};

exports.login = function(req, res) {
    res.render('user/login', {

    });
};

/**
 * Page with my images
 */
exports.images = function(req, res) {
    var page = req.params.page || 1;
    res.render('user/gallery', {

    });
};

