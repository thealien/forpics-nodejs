'use strict';

const LinkPager = require('../views/widgets/LinkPager.js');

module.exports = (router, config, container) => {
    const passport = container.require('app:passport');
    const {User, Image} = container.require('app:models');
    const pager = LinkPager.create(20, 10);

    const guestRequired = (req, res, next) => req.isAuthenticated() ? res.redirect('/') : next();
    const authRequired = (req, res, next) => !req.isAuthenticated() ? res.redirect('/') : next();

    /**
     * Registration page
     */
    router.route('/user/register')
        .all(guestRequired)
        .post((req, res, next) => {
            const {body} = req;
            const user = User.build({
                email: body.email,
                username: body.username,
                password: body.password
            });

            const validation = user.validate();
            validation
                .then((result = {}) => {
                    const {errors} = result;

                    if (errors.length) {
                        errors.forEach(error => req.flash('error', error.message));
                        return next();
                    }

                    user.save()
                        .then(user => {
                            req.logIn(user, error => {
                                return error ? next(error) : res.redirect('/');
                            });
                        })
                        .catch(() => {
                            req.flash('error', 'Не удалось зарегистрироваться. Попробуйте позже.');
                            next();
                        });
                })
                .catch(() => {
                    req.flash('error', 'Не удалось зарегистрироваться. Попробуйте позже.');
                    next();
                });
        })
        .all((req, res) => {
            const {body} = req;
            res.render('user/register', Object.assign({
                messages: req.flash()
            }, body));
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
        .get(function (req, res) {
            req.logout();
            res.redirect('/');
        });

    /**
     * Page with my images
     */
    router.route('/my/:page?')
        .all(authRequired)
        .get(function (req, res, next) {
            const limit = 2,
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
            }).catch(next);
        });

};