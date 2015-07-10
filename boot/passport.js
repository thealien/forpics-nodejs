'use strict';

var passport       = require('passport'),
    LocalStrategy  = require('passport-local').Strategy,
    User;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, function(username, password, done){
    User.find({ where: { username: username }}).success(function(user){
        if (!user) {
            return done(null, false, { error: 'Incorrect username.' });
        }
        if (!user.samePassword(password)) {
            return done(null, false, { error: 'Incorrect password.' });
        }
        return done(null, user);
    }).error(function (error) {
        done(error);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.userID);
});


passport.deserializeUser(function(id, done) {
    User.find({where: {userID: id}}).success(function (user) {
        done(null, user);
    }).error(function (error) {
        done(error);
    });
});

module.exports = function (app, config, container) {
    var models = container.require('app:models');
    User = models.User;

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (req, res, next) {
        app.locals.user = req.user;
        next();
    });

    return passport;
};