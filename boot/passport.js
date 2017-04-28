'use strict';

const passport = require('passport');
const {Strategy} = require('passport-local');

module.exports = (app, config, container) => {
    const {User} = container.require('app:models');
    const opts = {
        usernameField: 'username',
        passwordField: 'password'
    };

    passport.use(new Strategy(opts, (username, password, done) => {
        const query = User.find({where: {username: username}});
        query
            .then(user => {
                let errors;
                if (!user || !user.samePassword(password)) {
                    user = false;
                    errors = {error: 'Неверное имя пользователя и/или пароль'};
                }
                return done(null, user, errors);
            })
            .catch(done);
    }));

    passport.serializeUser((user, done) => done(null, user.userID));     

    passport.deserializeUser((id, done) => {
        const query = User.find({where: {userID: id}});
        query
            .then(function (user) {
                done(null, user);
            })
            .catch(done);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        app.locals.user = req.user;
        next();
    });

    return passport;
};