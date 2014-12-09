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
                body = req.body;

            user = User.build({
                email: body.email,
                username: body.username,
                password: body.password
            });
            user.save().success(function (user) {
                req.logIn(user, function(error) {
                    return error ? next(error) : res.redirect('/');
                });
            }).error(function (error) {
                    return next(error);
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