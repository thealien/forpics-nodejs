'use strict';

var Image = require('../models').Image;

/**
 * Page with image
 */
exports.image_single = function(req, res, next) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    Image.find({where: {
        path_date: path_date,
        guid: guid
    }}).success(function (image) {
        if (!image) {
            return res.send(404, 'Not found');
        }
        res.render('images/view', {
            images: [image]
        });
    }).error(function (error) {
        next(error);
    });
};

/**
 * Page with images group
 */
exports.images_group = function(req, res, next) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    Image.findAll({ where: {
        path_date: path_date,
        group: guid
    }}).success(function (images) {
        if (!images) {
            return res.send(404, 'Not found');
        }
        res.render('images/view', {
            images: images
        });
    }).error(function (error) {
        next(error);
    });
};

/**
 * Delete image
 */
exports.delete_image = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('images/delete', {

    });
};

exports.delete_image_handler = function (/*res, req*/) {

};
