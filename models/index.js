'use strict';

const Sequelize = require('sequelize');

module.exports = (app, config) => {
    const {host, port, database, user, password} = config.db;

    const db = new Sequelize(database, user, password, {
        host: host,
        port: port,
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