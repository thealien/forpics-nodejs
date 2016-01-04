'use strict';

var services = require('smallbox'),
    utils = require('../utils'),
    Sequelize = require('sequelize');

module.exports = function (app, config/*, container*/) {
    var dbConfig = config.db;

    var db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        define: {
            timestamps:      false,
            freezeTableName: true
        }
    });

    var Image = db.define('images', {
        /*
         PRIMARY KEY (`id`),
         UNIQUE KEY `guid` (`path_date`,`guid`) USING BTREE,
         KEY `userid_IDX` (`uploaduserid`),
         KEY `date_group_IDX` (`path_date`,`group`),
         KEY `delguid` (`path_date`,`deleteGuid`) USING BTREE
         */

        // `id` int(11) NOT NULL AUTO_INCREMENT
        id: {
            type:           Sequelize.INTEGER.UNSIGNED,
            autoIncrement:  true,
            primaryKey:     true,
            allowNull:      false
        },

        // `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },

        // `filename` text NOT NULL
        filename: {
            type: Sequelize.STRING(32),
            allowNull:      false
        },

        // `ip` varchar(15) NOT NULL
        ip: {
            type: Sequelize.STRING(15),
            allowNull:      false
        },

        // `deleteGuid` varchar(32) NOT NULL
        deleteGuid: {
            type: Sequelize.STRING(32),
            allowNull:      false
        },

        // `status` tinyint(4) NOT NULL DEFAULT '0'
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        // `width` int(11) NOT NULL DEFAULT '0'
        width: {
            type:           Sequelize.INTEGER.UNSIGNED,
            allowNull:      false
        },

        // `height` int(11) NOT NULL DEFAULT '0'
        height: {
            type:           Sequelize.INTEGER.UNSIGNED,
            allowNull:      false
        },

        // `uploaduserid` int(10) unsigned NOT NULL DEFAULT '0'
        uploaduserid: {
            type:           Sequelize.INTEGER.UNSIGNED,
            allowNull:      false
        },

        // `filesize` int(10) unsigned NOT NULL DEFAULT '0'
        filesize: {
            type:           Sequelize.INTEGER.UNSIGNED,
            allowNull:      false
        },

        // `preview` int(10) unsigned NOT NULL DEFAULT '0'
        preview: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        // `originalfilename` varchar(255) NOT NULL
        originalfilename: {
            type: Sequelize.STRING
        },

        // `useragent` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT '0 - browser, 1 - ihuploader',
        useragent: {
            type:           Sequelize.INTEGER(1)
        },

        // `guid` varchar(32) NOT NULL COMMENT 'image GUID (part of filename)'
        guid: {
            type: Sequelize.STRING(32),
            allowNull:      false
        },

        // `path_date` varchar(8) NOT NULL DEFAULT ''
        path_date: {
            type: Sequelize.STRING(8),
            allowNull:      false
        },

        // `group` varchar(32) NOT NULL DEFAULT '',
        group: {
            type: Sequelize.STRING(32),
            allowNull:      false
        }
    });


    var User = db.define('users', {
        /*
         PRIMARY KEY (`userID`),
         UNIQUE KEY `username` (`username`),
         UNIQUE KEY `email` (`email`)
         */

        // `userID` mediumint(8) unsigned NOT NULL AUTO_INCREMENT
        userID: {
            type:           Sequelize.INTEGER.UNSIGNED,
            autoIncrement:  true,
            primaryKey:     true,
            allowNull:      false
        },

        // `username` varchar(50) DEFAULT NULL
        username: {
            unique:     true,
            type: Sequelize.STRING(50),
            allowNull:      false,
            notEmpty: true,
            validate: {
                isUnique: function (username, done) {
                    username = String(username).trim();
                    User.find({ where: {username: username}, attributes: ['userID']})
                        .then(function (record) {
                            var error = record ? new Error('Username уже занят') : null;
                            done(error);
                        })
                        .catch(done);
                }
            }
        },

        // `password` varchar(100) DEFAULT NULL
        password: {
            type: Sequelize.STRING(50),
            allowNull:      false,
            set: function(password) {
                this.setDataValue('password', utils.md5(password));
            },
            validate: {
                notEmpty: true
            }
        },

        // `email` varchar DEFAULT NULL,
        email: {
            type: Sequelize.STRING,
            allowNull:      false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Email имеет неверный формат'
                },
                isUnique: function (email, done) {
                    email = String(email).trim();
                    User.find({ where: {email: email}, attributes: ['userID']})
                        .then(function (record) {
                            var error = record ? new Error('Email уже занят') : null;
                            done(error);
                        })
                        .catch(done);
                }
            }
        },

        // `role` enum('admin','user') NOT NULL DEFAULT 'user',
        role: {
            type: Sequelize.ENUM('admin', 'user'),
            defaultValue: 'user',
            allowNull:      false
        },

        // `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
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

    return {
        db: db,
        User: User,
        Image: Image
    };
};