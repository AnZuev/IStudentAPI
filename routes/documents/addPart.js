var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    try {
        var documentId = mongoose.Types.ObjectId(req.body.documentId);
        var newPart = req.body.newPart;
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }
    async.series([
        function(callback){
            DI.addPart(documentId,userId,newPart,callback);
        },
        function (callback) {
            FI.markFileUsed(newPart.id,callback);
        }
    ], function(err,results){
        if(err)
        {
            if (err.code == 204) {
                console.log(results[1]);
                res.json(results[1]);
                res.end();
            }
            if (err.code == 500) return next(new HttpError(500));
            if (err.code == 403) return next(new HttpError(403, "No access"));
            else return next(err);
        }else{
            res.json(results[1]);
            res.end();
        }
    });
};

