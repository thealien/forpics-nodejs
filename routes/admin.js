'use strict';

const LinkPager = require('../views/widgets/LinkPager.js');

module.exports = (router/*, config, container*/) => {
    const pager = LinkPager.create(20, 10);

    /**
     * Admin page
     */
    router.route('/admin/:page?')
        .all((req, res, next) => {
            if (req.isAuthenticated()) {
                next();
            } else {
                res.redirect('/');
            }
        })
        .post(function (/*res, req, next*/) {
            // TODO
        })
        .get((req, res) => {
            const page = req.params.page || 1;
            // TODO
            res.render('admin', {
                title:'Администрирование',
                pagination: pager.build({
                    currentPage:    page,
                    itemsCount:     count,
                    urlPrefix:      '/admin/'
                })
            });
        });

};