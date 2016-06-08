var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    
    try {
        var id = mongoose.Types.ObjectId(req.body.id);
        var comment = {
            author: req.session.user,
            text: req.body.comment
        };
    } catch (e) {
        return next(400);
    }

    DI.addComment(id,comment, function(err,results){
        if(err)
        {
            if (err.code == 500) return next(new HttpError(500));
            if (err.code == 404) return next(new HttpError(404, "Error!"));
            else return next(err);
        }else{
            res.json(results);
            res.end();
        }
    });
};

