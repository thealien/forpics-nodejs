'use strict';

const Pagination = require('pagination-object');

module.exports = (app, config, container) => {
    const passport = container.require('app:passport');
    const {User, Image} = container.require('app:models');

    const guestRequired = async (ctx, next) => req.isAuthenticated() ? ctx.redirect('/') : await next();
    const authRequired = async (req, res, next) => !req.isAuthenticated() ? ctx.redirect('/') : await next();

    /**
     * Registration page
     */
    app.route('/user/register')
        // .all(guestRequired)
        .post(async (ctx, next) => {
            const {flash} = ctx;
            const {body} = ctx.request;

            const user = User.build({
                email: body.email,
                username: body.username,
                password: body.password
            });

            try {
                const validation = await user.validate();
                const result = validation || {};
                const {errors} = result;

                if (errors && errors.length) {
                    flash.set(errors.map(error => ({
                        type: 'error', message:error.message
                    })));
                    return await next();
                }

                await user.save();
                // TODO
                /*
                req.logIn(user, error => {
                    return error ? next(error) : res.redirect('/');
                });
                */
            } catch (e) {
                flash.set([{
                    type: 'error', message: 'Не удалось зарегистрироваться. Попробуйте позже.'
                }]);
                await next();
            }

            /*
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
                });*/
        })
        .all(async ctx => {
            const {body} = ctx.request;
            ctx.body = await ctx.render('user/register', Object.assign({
                title:'Регистрация',
                messages: ctx.flash.get()
            }, body));
        });

    /**
     * Login page
     */

    app.route('/user/login')
        //.all(guestRequired)
        .post(async (ctx, next) => {
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
        .all(async ctx => {
            const {body} = ctx.request;
            const messages = ctx.flash.get();

            ctx.body = await ctx.render('user/login', {
                title:'Вход',
                username: body.username,
                password: body.password,
                messages: messages
            });
        });
/*
    app.route('/user/logout')
        .get(function (req, res) {
            req.logout();
            res.redirect('/');
        });

    app.route('/my/:page?')
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
        */

};