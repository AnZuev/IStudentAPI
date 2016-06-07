var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    try {
        var documentId = mongoose.Types.ObjectId(req.body.documentId);
        var newPartId = req.body.newPartId;
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }
    async.series([
        function(callback){
            DI.addPart(documentId,userId,newPartId,callback);
        },
        function (callback) {
            FI.markFileUsed(newPartId,callback);
        }
    ], function(err,results){
        if(err)
        {
            console.log(arguments);
            if (err.code == 204) return next(new HttpError(204, "Such part wasn't found"));
            if (err.code == 500) return next(new HttpError(500, "Error of DB"));
            if (err.code == 404) return next(new HttpError(404, "No data"));
            if (err.code == 403) return next(new HttpError(403, "No access"));
            else return next(err);
        }else{
            res.json(results[1]);
            res.end();
        }
    });
    };

