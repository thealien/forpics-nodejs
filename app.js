'use strict';

const express = require('express');
const container = require('smallbox');
const config = require('./config');
const app = express();

app.isProd = app.get('env') === 'production';

// boot
require('./boot')(app, config, container);

// routing
require('./routes')(app, config, container);

const {ENV_HOST, ENV_PORT} = process.env;
let {host, port} = config.app.server;

host = ENV_HOST || host;
port = ENV_PORT || port;
app.listen(port, host, () => console.log(`Server listening on ${host}:${port}`));