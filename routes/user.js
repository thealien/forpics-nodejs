'use strict';

const Pagination = require('pagination-object');

module.exports = (router, config, container) => {
    const passport = container.require('app:passport');
    const {User, Image} = container.require('app:models');

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
                .then((result) => {
                    result = result || {};
                    const {errors} = result;

                    if (errors && errors.length) {
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
                title:'Регистрация',
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
                title:'Вход',
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
            const imagesOnPage = 24,
                page = Math.max(req.params.page || 1, 1),
                offset = (page - 1) * imagesOnPage,
                userId = req.user.userID,
                where = {
                    uploaduserid: userId
                };

            Promise.all([
                Image.count({where: where}),
                Image.findAll({
                    where: where,
                    offset: offset,
                    limit: imagesOnPage,
                    order: 'id DESC'
                })
            ]).then(([count, images]) => {
                res.render('user/gallery', {
                    title:'Мои картинки',
                    images: images,
                    pagination: count <= imagesOnPage ? {} : Object.assign(new Pagination({
                        currentPage  : page,
                        totalItems   : count,
                        itemsPerPage : imagesOnPage
                    }), {
                        prefix: '/my/'
                    })
                });
            }).catch(next);
        });

};