var HttpError = require('../../error').HttpError;




exports.get = function(req, res, next){
    res.render("im");
    next();
};