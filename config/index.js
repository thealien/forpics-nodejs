'use strict';

const loader = require('configaro').create(__dirname);
exports.db = loader.load('db');
exports.app = loader.load('app');
exports.validation = loader.load('validation');
exports.multer = loader.load('multer');
exports.imageProcess = loader.load('image-process');
exports.logger = loader.load('logger');
exports.messages = loader.load('messages');
