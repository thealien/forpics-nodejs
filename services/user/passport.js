'use strict';

var passport       = require('passport'),
    LocalStrategy  = require('passport-local').Strategy,
    User = require('../../models').User;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(username, password, done){
    User.find({ username: username }).success(function(user){
        if (!user) {
            return done(null, false, { message:'Incorrect username.' });
        }
        if (!user.samePassword(password)) {
            return done(null, false, { message:'Incorrect password.' });
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
    User.find({userID: id}).success(function (user) {
        done(null, user);
    }).error(function (error) {
        done(error);
    });
});

module.exports = passport;