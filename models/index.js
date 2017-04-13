'use strict';

const Sequelize = require('sequelize');

module.exports = (app, config) => {
    const dbConfig = config.db;

    const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        define: {
            timestamps:      false,
            freezeTableName: true
        }
    });
    const User = db.import('User.js');
    const Image = db.import('Image.js');

    return {
        db: db,
        User: User,
        Image: Image
    };
};