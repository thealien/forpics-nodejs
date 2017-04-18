'use strict';

const Pagination = require('pagination-object');

module.exports = (router, config, container) => {
    const processor = container.require('image:processor');
    const {Image} = container.require('app:models');
    /**
     * Admin page
     */
    router.route('/admin/:page?')
        .all((req, res, next) => {
            if (!req.isAuthenticated()) {
                return res.redirect('/');
            }
            next();
        })
        .get((req, res, next) => {
            const limit = 10,
                page = Math.max(req.params.page || 1, 1),
                offset = (page - 1) * limit,
                where = {
                    status: 0
                };

            Promise.all([
                Image.count({where: where}),
                Image.findAll({
                    where: where,
                    offset: offset,
                    limit: limit,
                    order: 'id ASC'
                })
            ]).then(([count, images]) => {
                res.render('admin/index', {
                    title:'Администрирование',
                    images: images,
                    pagination: Object.assign(new Pagination({
                        currentPage  : page,
                        totalItems   : count,
                        itemsPerPage : limit
                    }), {
                        prefix: '/admin/'
                    })
                });
            }).catch(next);
        });

    router.route('/admin/delete/:guid')
        .post((req, res, next) => {
            const {guid} = req.params;
            if (!guid) {
                const error = new Error('Bad request');
                error.status = 400;
                return next(error);
            }

            const query = Image.find({
                where: {
                    deleteGuid: guid
                }
            });
            query
                .then(image => {
                    if (!image) {
                        const error = new Error('Image not found');
                        error.status = 404;
                        return next(error);
                    }

                    processor.delete(image, () => {
                        image.destroy()
                            .then(() => {
                                return res.json({
                                    success: true
                                });
                            })
                            .catch(next);
                    });

                })
                .catch(next);
        });

    router.route('/admin/approve/')
        .post((req, res, next) => {
            const {guids} = req.body;

            if (!(guids instanceof Array)) {
                const error = new Error('Bad request');
                error.status = 400;
                return next(error);
            }

            const query = Image.update({
                status: 1
            }, {
                where: {
                    guid: {
                        $in: guids
                    }
                }
            });
            query
                .then(() => {
                    return res.json({
                        success: true
                    });
                })
                .catch(next);
        });
};