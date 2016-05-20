var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;
var mongoose = require("../../../libs/mongoose");

exports.post = function(req, res, next){

    var id;
    try {
        id = mongoose.Types.ObjectId(req.body.id);
    }
    catch (err){
        next(new HttpError(400, "Не переданы все необходимые параметры"));
    }


    SI.removeSubjectById(id, function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json({result: result});
            res.end();
            next();
        }
    })

};