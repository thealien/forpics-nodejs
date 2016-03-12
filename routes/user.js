'use strict';

const LinkPager = require('../views/widgets/LinkPager.js');

module.exports = function (router, config, container) {
    const passport = container.require('app:passport'),
        models = container.require('app:models'),
        User = models.User,
        Image = models.Image,
        pager = LinkPager.create(20, 10);

    const guestRequired = function (req, res, next) {
            if (req.isAuthenticated()) {
                return res.redirect('/');
            }
            next();
        },
        authRequired = function (req, res, next) {
            if (!req.isAuthenticated()) {
                return res.redirect('/');
            }
            next();
        };

    /**
     * Registration page
     */
    router.route('/user/register')
        .all(guestRequired)
        .post(function (req, res, next) {
            const body = req.body,
                user = User.build({
                    email: body.email,
                    username: body.username,
                    password: body.password
                });

            user.validate().then(function (result) {
                if (result && result.errors.length) {
                    result.errors.forEach(function (error) {
                        req.flash('error', error.message);
                    });
                    return next();
                }

                user.save()
                    .then(function (user) {
                        req.logIn(user, function (error) {
                            return error ? next(error) : res.redirect('/');
                        });
                    })
                    .catch(function (error) {
                        req.flash('error', 'Не удалось зарегистрироваться. Попробуйте позже.');
                        next();
                    });
            });
        })
        .all(function (req, res) {
            const body = req.body,
                messages = req.flash();

            res.render('user/register', {
                email: body.email,
                username: body.username,
                password: body.password,
                password2: body.password2,
                messages: messages
            });
        });

    /**
     * Login page
     */
    router.route('/user/login')
        .all(guestRequired)
        .post(function (req, res, next) {
            passport.authenticate('local', function (error, user, info) {

                if (info && info.error) {
                    req.flash('error', info.error);
                }

                if (error) {
                    return next(error);
                }

                if (!user) {
                    return next();
                }

                req.logIn(user, function (error) {
                    return error ? next(error) : res.redirect('/');
                });
            })(req, res, next);
        })
        .all(function (req, res) {
            const body = req.body,
                messages = req.flash();

            res.render('user/login', {
                username: body.username,
                password: body.password,
                messages: messages
            });
        });

    /**
     *
     */
    router.route('/user/logout')
        .post(function (req, res) {
            req.logout();
            res.redirect('/');
        });


    /**
     * Page with my images
     */
    router.route('/my/:page?')
        .all(authRequired)
        .get(function (req, res) {
            const limit = 18,
                page = Math.max(req.params.page || 1, 1),
                offset = (page - 1) * limit,
                userId = req.user.userID,
                where = {
                    uploaduserid: userId
                };

            Image.count({where: where}).then(function (count) {
                Image.findAll({
                    where: where,
                    offset: offset,
                    limit: limit,
                    order: 'id DESC'
                }).then(function (images) {
                    res.render('user/gallery', {
                        images: images,
                        pagination: pager.build({
                            currentPage: page,
                            itemsCount: count,
                            urlPrefix: '/my/'
                        })
                    });
                }).catch(next);
            });
        });

};