'use strict';

module.exports = function (router, config, container) {
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
        .post(function (/*res, req*/) {

        })
        .get(function(req, res) {
            var params = req.params,
                path_date = params.path_date,
                guid = params.guid;

            res.render('images/delete', {

            });
        });
};