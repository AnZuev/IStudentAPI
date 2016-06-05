var util = require('util');
var DI = require(appRoot+'/models/documents').document;
var FI = require(appRoot+'/models/file').file;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");
var SI = require(appRoot+'/models/subject').subject;
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
        var err = new HttpError(400, util.format("Error!"));
        return next(err);
    }
    
        async.series([
            function (callback) {
                SI.isExist(document.search.subject, callback);

            },
            function (callback) {
                DI.addDocument(document, callback);
            }
        ], function (err, results) {
            // console.log(results['1']);
            if (err) {
                if (err.code == 404) return next(new HttpError(404, "No subject"));
                else if (err.code == 500) next(new HttpError(500, "Ошибка в добавлении"));
                else next(err);
            } else {
                if(req.body.parts.length>0) {
                    document.parts.forEach(function (part) {
                        console.log(part);
                        FI.markFileUsed(part.url,function(err,res){
                            if (err) return next(new HttpError(400, "Произошла ошибка в добавлении частей файла"));
                        });
                    });
                }
                console.log(arguments);
                res.json(results['1']);
                res.end();
                next();
            }
        });
};