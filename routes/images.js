'use strict';

var fs = require('fs'),
    util = require('util');

module.exports = function (router, config, container) {
    var processor = container.require('image:processor');
    var models = container.require('app:models');
    var Image = models.Image;

    /**
     * Page with image
     */
    router.get('/image/:path_date/:guid', function(req, res, next) {
        var params = req.params,
            path_date = params.path_date,
            guid = params.guid;

        Image.find({where: {
            path_date: path_date,
            guid: guid
        }}).then(function (image) {
            if (!image) {
                return res.status(404).send('Not found');
            }

            res.render('images/view', {
                images: [image],
                messages: req.flash()
            });
        }).catch(function (error) {
            next(error);
        });
    });


    /**
     * Page with images group
     */
    router.get('/images/:path_date/:guid', function(req, res, next) {
        var params = req.params,
            path_date = params.path_date,
            guid = params.guid;

        Image.findAll({ where: {
            path_date: path_date,
            group: guid
        }}).then(function (images) {
            if (!images || !images.length) {
                return res.status(404).send('Not found');
            }

            res.render('images/view', {
                images: images,
                messages: req.flash()
            });
        }).catch(function (error) {
            next(error);
        });
    });


    /**
     * Delete image
     */
    router.route('/delete/:path_date/:guid')
        .post(function (req, res) {
            var params = req.params,
                path_date = params.path_date,
                guid = params.guid;

            Image.find({ where: {
                path_date: path_date,
                deleteGuid: guid
            }}).then(function (image) {
                if (!image) {
                    return res.status(404).send('Not found');
                }

                processor.delete(image, function () {
                    image.destroy().then(function () {
                        res.redirect('/my/');
                    }).catch(function (error) {
                        next(error);
                    });
                });

            }).catch(function (error) {
                next(error);
            });
        })
        .get(function(req, res) {
            var params = req.params,
                path_date = params.path_date,
                guid = params.guid;

            Image.find({ where: {
                path_date: path_date,
                deleteGuid: guid
            }}).then(function (image) {
                if (!image) {
                    return res.status(404).send('Not found');
                }

                res.render('images/delete', {
                    image: image,
                });
            }).catch(function (error) {
                next(error);
            });
        });
};