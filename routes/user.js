'use strict';

var LinkPager = require('../views/widgets/LinkPager.js');

module.exports = function (router, config, container) {
    var passport = container.require('app:passport');
    var models = container.require('app:models');
    var User = models.User;
    var Image = models.Image;
    var pager = LinkPager.create(20, 10);


    /**
     * Registration page
     */
    router.route('/user/register')
        .post(function (req, res, next) {
            var user,
                body = req.body,
                messages = [];

            user = User.build({
                email: body.email,
                username: body.username,
                password: body.password
            });

            user.validate().then(function (result) {
                result.errors.forEach(function (error) {
                    messages.push(error.message);
                });

                if (messages.length) {
                    req.body.messages = messages;
                    return res.render('user/register', req.body);
                } else {
                    user.save()
                        .then(function (user) {
                             req.logIn(user, function(error) {
                             return error ? next(error) : res.redirect('/');
                             });
                         })
                        .catch(function (error) {
                            req.body.messages = [
                                'Не удалось зарегистрироваться. Попробуйте позже.'
                            ];
                            res.render('user/register', req.body);
                        });
                }
            });
        })
        .all(function(req, res) {
            res.render('user/register', req.body);
        });

    /**
     * Login page
     */
    router.route('/user/login')
        .post(function (req, res, next) {
            passport.authenticate('local', function(error, user, info) {

                if (info && info.error) {
                    req.flash('error', info.error);
                }

                if (error) {
                    return next(error);
                }

                if (!user) {
                    return next();
                }

                req.logIn(user, function(error) {
                    return error ? next(error) : res.redirect('/');
                });
            })(req, res, next);
        })
        .all(function(req, res) {
            var body = req.body,
                messages = req.flash();

            console.log(messages);

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
    router.all(function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    }).get('/my/:page?', function(req, res) {
        var limit = 18,
            page = Math.max(req.params.page || 1, 1),
            offset = (page-1) * limit,
            userId = req.user.id,
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
                        currentPage:    page,
                        itemsCount:     count,
                        urlPrefix:      '/my/'
                    })
                });
            }).catch(function (error) {
                next(error);
            });
        });
    });

};