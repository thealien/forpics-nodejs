'use strict';

var LinkPager = require('../views/widgets/LinkPager.js');

module.exports = function (router, config, container) {

    var pager = LinkPager.create(20, 10);

    /**
     * Admin page
     */
    router.route('/admin/:page?')
        .all(function (req, res, next) {
            if (req.isAuthenticated()) {
                next();
            } else {
                res.redirect('/');
            }
        })
        .post(function (/*res, req, next*/) {

        })
        .get(function(req, res) {
            var page = req.params.page || 1;
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