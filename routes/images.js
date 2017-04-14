'use strict';

module.exports = (router, config, container) => {
    const processor = container.require('image:processor');
    const {Image} = container.require('app:models');

    /**
     * Page with image
     */
    router.get('/image/:path_date/:guid', (req, res, next) => {
        const {path_date, guid} = req.params;

        const query = Image.find({
            where: {path_date, guid}
        });

        query
            .then(image => {
                if (!image) {
                    return res.status(404).send('Not found');
                }

                res.render('images/view', {
                    images: [image],
                    messages: req.flash()
                });
            })
            .catch(next);
    });


    /**
     * Page with images group
     */
    router.get('/images/:path_date/:guid', (req, res, next) => {
        const {path_date, guid} = req.params;

        const query = Image.findAll({
            where: {
                path_date,
                group: guid
            }
        });
        query
            .then(images => {
                if (!images || !images.length) {
                    return res.status(404).send('Not found');
                }

                res.render('images/view', {
                    images: images,
                    messages: req.flash()
                });
            })
            .catch(next);
    });


    /**
     * Delete image
     */
    router.route('/delete/:path_date/:guid')
        .post((req, res, next) => {
            const {path_date, guid} = req.params;

            const query = Image.find({
                where: {
                    path_date,
                    deleteGuid: guid
                }
            });
            query
                .then(image => {
                    if (!image) {
                        return res.status(404).send('Not found');
                    }

                    processor.delete(image, () => {
                        image.destroy()
                            .then(() => res.redirect('/my/'))
                            .catch(next);
                    });

                })
                .catch(next);
        })
        .get((req, res, next) => {
            const {path_date, guid} = req.params;

            const query = Image.find({
                where: {
                    path_date,
                    deleteGuid: guid
                }
            });
            query
                .then(image => {
                    if (!image) {
                        return res.status(404).send('Not found');
                    }

                    res.render('images/delete', {
                        image: image,
                    });
                })
                .catch(next);
        });
};