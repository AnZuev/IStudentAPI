var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    console.log(req.body);
    try {
        var id = mongoose.Types.ObjectId(req.body.id);
        //var userId = req.session.user;
        var comment = req.body.comment;

        // var comment = mongoose.Types.String(req.body.comment);
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

