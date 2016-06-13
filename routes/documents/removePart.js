var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');
var log = require(appRoot+'/libs/log')(module);

exports.post = function(req, res, next) {
    try {
        var documentId = mongoose.Types.ObjectId(req.body.documentId);
        var partId = mongoose.Types.ObjectId(req.body.partId);
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }

    async.series([
        function(callback){
            DI.removePart(documentId,userId,partId,callback);
        },
        function (callback) {
            FI.markFileUnUsed(partId,callback);
        }
    ], function(err,results){
        if(err)
        {
            if (err.code == 500) return next(new HttpError(500));
            if (err.code == 403) return next(new HttpError(403, "No access"));
            else return next(err);
        }else {
            if (results[1] == false) return log.err("file wasn't marked as unused");
            else {
                res.json(results[0]);
                res.end();
            }
        }
    });
};

