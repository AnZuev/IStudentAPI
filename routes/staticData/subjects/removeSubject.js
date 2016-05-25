var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;
var mongoose = require("../../../libs/mongoose");
var util = require('util');

exports.post = function(req, res, next){
    var id;
    try {
        id = mongoose.Types.ObjectId(req.body.id);
    }
    catch (e){
        return next(new HttpError(400, "Не переданы все необходимые параметры"));
    }
    SI.removeSubjectById(id, function (err, result) {
        if (err) {
            if (err.code == 204) next(new HttpError(204, "No subjects found to remove"));
            else next(new HttpError(400, util.format("Ошибка при удалении %s", err.message)));
        } else {
            res.json({result: result});
            res.end();
            next();
        }
    })
};