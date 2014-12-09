'use strict';

var config      = require('./config');
var express     = require('express');
var container   = require('smallbox');
var app         = express();
var port        = process.env.PORT || 3000;

// boot
require('./boot')(app, config, container);

// routing
require('./routes')(app, config);

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});