'use strict';

const Pagination = require('pagination-object');

module.exports = (router, config, container) => {
    const processor = container.require('image:processor');
    const {Image} = container.require('app:models');

    const checkAdmin = (req, res, next) => {
        const {user} = req;
        if (user && user.isAdmin()) {
            return next();
        }
        return res.status(403).send('Forbidden');
    };

    /**
     * Check iа user is admin
     */
    router.route('/admin/?*').all(checkAdmin);

    /**
     * Show no approved images
     */
    router.route('/admin/:page?')
        .get((req, res, next) => {
            const imagesOnPage = 12;
            const page = Math.max(req.params.page || 1, 1);
            const offset = (page - 1) * imagesOnPage;
            const where = { status: 0 };

            Promise.all([
                Image.count({where: where}),
                Image.findAll({
                    where: where,
                    offset: offset,
                    limit: imagesOnPage,
                    order: 'id ASC'
                })
            ]).then(([count, images]) => {
                return res.render('admin/index', {
                    title:'Администрирование',
                    images: images,
                    pagination: count <= imagesOnPage ? {} : Object.assign(new Pagination({
                        currentPage  : page,
                        totalItems   : count,
                        itemsPerPage : imagesOnPage
                    }), {
                        prefix: '/admin/'
                    })
                });
            }).catch(next);
        });

    /**
     * Delete not approved image
     */
    router.route('/admin/delete/:guid')
        .post((req, res, next) => {
            const {guid} = req.params;
            if (!guid) {
                return res.status(400).send('Bad request');
            }

            const query = Image.find({
                where: {
                    deleteGuid: guid
                }
            });

            query
                .then(image => {
                    if (!image) {
                        return res.status(404).send('Not found');
                    }

                    processor.delete(image, () => {
                        return image.destroy()
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

    /**
     * Approve images
     */
    router.route('/admin/approve/')
        .post((req, res, next) => {
            const {guids} = req.body;

            if (!(guids instanceof Array)) {
                return res.status(400).send('Bad request');
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