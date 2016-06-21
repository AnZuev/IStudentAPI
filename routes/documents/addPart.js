var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    try {
        var documentId = mongoose.Types.ObjectId(req.body.documentId);
        var newPart = {
            url:req.body.newPartUrl};
        var userId = req.session.user;
    } catch (e) {
        return next(400);
    }
    async.series([ //нет проверки на существование файла
        function(callback){
            DI.addPart(documentId,userId,newPart,callback);
        },
        function (callback) {
            FI.markFileUsed(newPart.url,callback);
        }
    ], function(err,results){
        if(err)
        {
            if (err.code == 204) {
                res.json(err.document);
                res.end();
            }
            else if (err.code == 500) return next(new HttpError(500));
            else if (err.code == 403) return next(new HttpError(403, "No access"));
            else return next(err);
        }else{
            console.log(results[0]);
            if (results[1] == false) {
                return next(new HttpError(400));
            }
            else {
                res.json(results[0]);
                res.end();
            }
        }
    });
};

