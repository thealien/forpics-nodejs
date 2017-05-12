'use strict';

const Koa = require('koa');
const container = require('smallbox');
const config = require('./config');
const app = new Koa();

app.context.isProd = app.env === 'production';

// boot
require('./boot')(app, config, container);

// routing
require('./routes')(app, config, container);

const {ENV_HOST, ENV_PORT} = process.env;
let {host, port} = config.app.server;

host = ENV_HOST || host;
port = ENV_PORT || port;
app.listen(port, host);
console.log(`Server listening on ${host}:${port}`);