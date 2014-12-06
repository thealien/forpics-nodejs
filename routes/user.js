'use strict';

var services = require('smallbox'),
    passport = services.require('app:passport'),
    User = require('../models').User;

/**
 * Handle POST request for registration
 * @param req
 * @param res
 * @param next
 */
exports.register_handler = function (req, res, next) {
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
};

/**
 * Show form for registration
 * @param req
 * @param res
 */
exports.register = function(req, res) {
    res.render('user/register', req.params);
};

/**
 * Handle POST request for login
 * @param req
 * @param res
 * @param next
 */
exports.login_handler = function (req, res, next) {
    passport.authenticate('local', function(error, user, info) {
        if (error) {
            return next(error);
        }

        if (!user) {
            return res.redirect('/');
        }

        req.logIn(user, function(error) {
            return error ? next(error) : res.redirect('/');
        });
    })(req, res, next);
};

/**
 * Show login form
 * @param req
 * @param res
 */
exports.login = function(req, res) {
    res.render('user/login', req.params);
};

/**
 * Handle POST request for logout
 * @param req
 * @param res
 */
exports.logout_handler =  function (req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Page with user's images
 * @param req
 * @param res
 */
exports.images = function(req, res) {
    var page = req.params.page || 1;
    res.render('user/gallery', {

    });
};

