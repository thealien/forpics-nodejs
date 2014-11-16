'use strict';

exports.images = function(req, res) {
    var page = req.params.page || 1;
    res.render('admin', {
        title:'Администрирование'
    });
};

exports.action = function (/*res, req, next*/) {

};
