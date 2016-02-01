var HttpError = require('../../error').HttpError;
var config = require('../../config');
var host = config.get('general:host');
var publicStaticServer =config.get('general:publicStaticServer');




exports.get = function(req, res, next){

    res.render("im", {
        host: host,
        notifications: 5,
	    publicStaticServer: publicStaticServer
    });
    next();
};