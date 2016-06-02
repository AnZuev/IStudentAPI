var util = require('util');
var DI = require('../../../models/documents').document;
var FI = require('../../../models/file').file;
var HttpError = require('../../../error/index').HttpError;
var mongoose = require("../../../libs/mongoose");

exports.post = function(req, res, next){
    console.log(arguments);
    var document = req.body.document;

    // var error = new HttpError(400, util.format("Не переда"))
    try {
        if (req.body.document.title.length < 6 || req.body.document.title.length > 50)
            return next(new HttpError(400, util.format("Невозможно добавить документ с названием %s", req.body.document.title)));
        document.title = req.body.document.title;
        document.author = mongoose.Types.ObjectId(req.session.user);
        document.search.cType = req.body.document.cType;
        document.search.subject = req.body.document.subject;

        document.search.universities = req.user.university;
        document.search.faculties = req.user.faculty;
        document.search.year = req.user.year;

    }catch(e){
        var err = new HttpError(400, util.format("Не переданы все необходимые параметры"));
        next(err);
    }

    if (req.query.isParts == 1) ///
    {
        // совпадение айди
        // document.parts.forEach(function(item,callback){
        //         FI.getFilePathAndAccessByUrl(item.id,callback){
        //         if (!res) {
        //             return next(new HttpError(404, "Не найдена часть загружаемых файлов"));
        //         }
        //     };
        // });
    }

    else {
        DI.addDocument(document, function (err, result) {
            if (err) {
                if (err.code == 500) next(new HttpError(500, util.format("Ошибка в добавлении")));
                else next(err);
            } else {
                res.json(result);
                res.end();
                next();
            }});
    }



};

