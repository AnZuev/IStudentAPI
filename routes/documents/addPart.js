var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var async = require('async');

exports.post = function(req, res, next) {
    //var newPart = req.body.newPart;
    try {
        var documentId = mongoose.Types.ObjectId(req.body.documentId);
        var url = req.body.url;
        var userId = mongoose.Types.ObjectId(req.session.user);
    } catch (e) {
        var err = new HttpError(400,"Error!");
        return next(err);
    }

    async.waterfall([
        function (callback) {
            FI.getFilePathAndAccessByUrl(url,callback(null,'file'));
        },
        function(file,callback){
            DI.addPart(documentId,userId,file.id,callback);
        },
        function (callback) {
            FI.markFileUsed(url,callback);
        }
    ], function(err,results){
        if(err)
        {
            console.log(arguments);
            if (err.code == 500) return next(new HttpError(500, "Ошибка БД"));
            if (err.code == 404) return next(new HttpError(404, "Данные не получены"));
            if (err.code == 403) return next(new HttpError(403, "error"));
            else return next(err);
        }else{
            res.json(results['1']);
            res.end();
            next();
        }
    });

    // DI.addPart(documentId,userId,newPart,function (err,res){
    //     if(err) return next(new HttpError(400,"Error! Can not add part"));
    //     else{
    //         res.json(result);
    //         res.end();
    //         next();
    //     }
    // });


        // document.parts.forEach(function(item,callback){
        //         FI.getFilePathAndAccessByUrl(item.id,callback){
        //         if (!res) {
        //             return next(new HttpError(404, "?? ??????? ????? ??????????? ??????"));
        //         }
        //     };
        // });


};

