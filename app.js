'use strict';

const express = require('express');
const container = require('smallbox');
const config = require('./config');
const app = express();
const port = process.env.PORT || 3000;

app.isProd = app.get('env') === 'production';

// boot
require('./boot')(app, config, container);

// routing
require('./routes')(app, config, container);

app.listen(port, () => console.log('Server listening on port ' + port));