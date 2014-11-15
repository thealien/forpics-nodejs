'use strict';

exports.images = function(req, res) {
    var page = req.params.page || 1;
    res.render('index', { title: 'admin on page '+ page });
};

exports.action = function (/*res, req, next*/) {

};
