'use strict';

const Sequelize = require('sequelize');

module.exports = (app, config) => {
    const {host, port, database, user, password} = config.db;
    const opts = {
        host,
        port,
        define: {
            timestamps: false,
            freezeTableName: true
        }
    }
    if (app.isProd) {
        opts.logging = false;
    }

    const db = new Sequelize(database, user, password, opts);

    const User = db.import('User.js');
    const Image = db.import('Image.js');

    return {db, User, Image};
};