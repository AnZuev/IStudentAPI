var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.post = function(req, res, next) {
    try {
        var id = mongoose.Types.ObjectId(req.body.id);
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }
    DI.addDislike(id,userId, function(err,results){
        if(err)
        {
            if (err.code == 500) return next(new HttpError(500));
            if (err.code == 403) return next(new HttpError(403, "No access"));
            else return next(err);
        }else{
            res.json(results);
            res.end();
        }
    });
};

