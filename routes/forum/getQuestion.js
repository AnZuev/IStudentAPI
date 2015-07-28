var Question  = require('../../models/Forum').Question;
var HttpError = require('../../error').HttpError;


exports.get = function(req, res, next){
    res.send(JSON.stringify(res.locals.question));
    res.end();
    next();
};

