'use strict';

module.exports = function (db, DataTypes) {

    return db.define('images', {
        /*
         PRIMARY KEY (`id`),
         UNIQUE KEY `guid` (`path_date`,`guid`) USING BTREE,
         KEY `userid_IDX` (`uploaduserid`),
         KEY `date_group_IDX` (`path_date`,`group`),
         KEY `delguid` (`path_date`,`deleteGuid`) USING BTREE
         */

        // `id` int(11) NOT NULL AUTO_INCREMENT
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        // `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },

        // `filename` text NOT NULL
        filename: {
            type: DataTypes.STRING(32),
            allowNull: false
        },

        // `ip` varchar(15) NOT NULL
        ip: {
            type: DataTypes.STRING(15),
            allowNull: false
        },

        // `deleteGuid` varchar(32) NOT NULL
        deleteGuid: {
            type: DataTypes.STRING(32),
            allowNull: false
        },

        // `status` tinyint(4) NOT NULL DEFAULT '0'
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // `width` int(11) NOT NULL DEFAULT '0'
        width: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },

        // `height` int(11) NOT NULL DEFAULT '0'
        height: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },

        // `uploaduserid` int(10) unsigned NOT NULL DEFAULT '0'
        uploaduserid: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },

        // `filesize` int(10) unsigned NOT NULL DEFAULT '0'
        filesize: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },

        // `preview` int(10) unsigned NOT NULL DEFAULT '0'
        preview: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // `originalfilename` varchar(255) NOT NULL
        originalfilename: {
            type: DataTypes.STRING
        },

        // `useragent` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT '0 - browser, 1 - ihuploader',
        useragent: {
            type: DataTypes.INTEGER(1)
        },

        // `guid` varchar(32) NOT NULL COMMENT 'image GUID (part of filename)'
        guid: {
            type: DataTypes.STRING(32),
            allowNull: false
        },

        // `path_date` varchar(8) NOT NULL DEFAULT ''
        path_date: {
            type: DataTypes.STRING(8),
            allowNull: false
        },

        // `group` varchar(32) NOT NULL DEFAULT '',
        group: {
            type: DataTypes.STRING(32),
            allowNull: false
        }
    });

};