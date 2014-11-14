'use strict';

/**
 * Page with image
 */
exports.image_single = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('index', { title: 'Page with image ' + path_date + '/' +  guid});
};

/**
 * Page with images group
 */
exports.images_group = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;

    res.render('index', { title: 'Page with images group ' + path_date + '/' +  guid });
};

/**
 * Delete image
 */
exports.delete_image = function(req, res) {
    var params = req.params,
        path_date = params.path_date,
        guid = params.guid;
    res.render('index', { title: 'Delete image ' + path_date + '/' +  guid});
};

exports.delete_image_handler = function (res, req) {

};
