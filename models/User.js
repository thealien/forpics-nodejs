'use strict';

const utils = require('../utils');

module.exports = function (db, DataTypes) {

    const User = db.define('users', {
        /*
         PRIMARY KEY (`userID`),
         UNIQUE KEY `username` (`username`),
         UNIQUE KEY `email` (`email`)
         */

        // `userID` mediumint(8) unsigned NOT NULL AUTO_INCREMENT
        userID: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        // `username` varchar(50) DEFAULT NULL
        username: {
            unique: true,
            type: DataTypes.STRING(50),
            allowNull: false,
            notEmpty: true,
            validate: {
                isUnique: (username, done) => {
                    username = String(username).trim();
                    const query = User.find({
                        where: {username}, attributes: ['userID']
                    });
                    query
                        .then(record => {
                            const error = record ? new Error('Логин уже занят') : null;
                            done(error);
                        })
                        .catch(done);
                }
            }
        },

        // `password` varchar(100) DEFAULT NULL
        password: {
            type: DataTypes.STRING(50),
            allowNull: false,
            set: function (password) {
                this.setDataValue('password', utils.md5(password));
            },
            validate: {
                notEmpty: true
            }
        },

        // `email` varchar DEFAULT NULL,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Email имеет неверный формат'
                },
                isUnique: (email, done) => {
                    email = String(email).trim();
                    const query = User.find({
                        where: {email},
                        attributes: ['userID']
                    });
                    query
                        .then(record => {
                            const error = record ? new Error('Email уже занят') : null;
                            done(error);
                        })
                        .catch(done);
                }
            }
        },

        // `role` enum('admin','user') NOT NULL DEFAULT 'user',
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user',
            allowNull: false
        },

        // `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        instanceMethods: {
            samePassword: function (password) {
                return this.password === utils.md5(password);
            },
            isAdmin: function () {
                return this.role === 'admin';
            }
        }
    });

    return User;

};