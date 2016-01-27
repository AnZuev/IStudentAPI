var HttpError = require('../../error').HttpError;
var config = require('../../config');
var host = config.get('general:host');



exports.get = function(req, res, next){

    res.render("im", {
        host: host,
        notifications: 5
    });
    next();
};