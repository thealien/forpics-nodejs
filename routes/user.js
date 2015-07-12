'use strict';

module.exports = function (router, config, container) {
    var passport = container.require('app:passport');
    var models = container.require('app:models');
    var User = models.User;


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
    router.get('/my/:page?', function(req, res) {
        //var page = req.params.page || 1;
        res.render('user/gallery', {

        });
    });

};