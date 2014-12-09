'use strict';

module.exports = function (router, config, container) {

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
                title:'Администрирование'
            });
        });

};