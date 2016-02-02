var HttpError = require('../../error').HttpError;
var config = require('../../config');
var host = config.get('general:host');
var publicStaticServer =config.get('general:publicStaticServer');
var templates = require('../../views/frontEndTemplates/im');



exports.get = function(req, res, next){

    res.render("im", {
        host: host,
        notifications: 5,
	    publicStaticServer: publicStaticServer,
	    templates: templates,
	    user: req.user
    });
    next();
};