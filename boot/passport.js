'use strict';

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function (app, config, container) {
    const models = container.require('app:models'),
        User = models.User;

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        User.find({where: {username: username}})
            .then(function (user) {
                let errors;
                if (!user || !user.samePassword(password)) {
                    user = false;
                    errors = {error: 'Неверное имя пользователя и/или пароль'};
                }
                return done(null, user, errors);
            })
            .catch(done);
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.userID);
    });

    passport.deserializeUser(function (id, done) {
        User.find({where: {userID: id}})
            .then(function (user) {
                done(null, user);
            })
            .catch(done);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (req, res, next) {
        app.locals.user = req.user;
        next();
    });

    return passport;
};