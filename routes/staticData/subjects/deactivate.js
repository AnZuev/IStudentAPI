var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;
var mongoose = require("../../../libs/mongoose");

exports.post = function(req, res, next){

    var id;
    try {
        id = req.body.id;
        id = mongoose.Types.ObjectId(id);
    }
    catch (err){
        next(new HttpError(400, "Не переданы все необходимые параметры"));
    }

    SI.deactivate(id, function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json({result: result});
            res.end();
            next();
        }
    })
};