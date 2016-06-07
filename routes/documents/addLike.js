var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    console.log(req.body);
    try {
        var id = mongoose.Types.ObjectId(req.body);
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }

    DI.addLike(id,userId, function(err,results){
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

