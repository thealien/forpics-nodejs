'use strict';

/**
 * Page with image
 */
exports.image_single = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('images/view', {

    });
};

/**
 * Page with images group
 */
exports.images_group = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('images/view', {

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
