var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var SI = require(appRoot+'/models/subject').subject;
var TI = require(appRoot+'/models/workTypes').WorkTypes;

var async = require('async');

exports.post = function(req, res, next) {
    var document = req.body;
    if (document.title.length < 6 || document.title.length > 50)
        return next(new HttpError(400, util.format("Невозможно добавить документ с названием %s", document.title)));
    try {
        document.author = mongoose.Types.ObjectId(req.session.user);
        document.search.cType = mongoose.Types.ObjectId(req.body.search.type);
        document.search.subject = mongoose.Types.ObjectId(req.body.search.subject);
        document.search.universities = req.user.university;
        document.search.faculties = req.user.faculty;
        document.search.year = req.user.year;
    } catch (e) {
        return next(400);
    }
    async.series([
        function (callback) {
            SI.isExist(document.search.subject, callback);
        },
        function (callback) {
            TI.isExist(document.search.cType, callback);
        },
        function (callback) {
            DI.addDocument(document, callback);
        }
    ], function (err, results) {
        if (err) {
            if (err.code == 404) return next(new HttpError(400, "There is no such subject"));
            else if (err.code == 500) return next(new HttpError(500, "Error in addition"));
            else return next(err);
        } else {
            if(req.body.parts.length>0) {
                document.parts.forEach(function (part) {
                    FI.markFileUsed(part.url,function(err,res){
                        if (err) return next(err);
                    });
                });
            }
            res.json(results[2]);
            res.end();
        }
    });
};