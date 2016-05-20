var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;
var mongoose = require("../../../libs/mongoose");

exports.post = function(req, res, next){

    var newTitle, id;
    try {
        newTitle = req.body.title;
        id = mongoose.Types.ObjectId(req.body.id);
    }
    catch (err){
        next(new HttpError(400, "Не переданы все необходимые параметры"));
    }   
    if(newTitle.length > 0) {
        SI.changeName(id, newTitle,  function (err, result) {
            if (err) {
                next(err);
            } else {

                res.json({result: result});
                res.end();
                next();
            }
        })
    } else{
        var err = new HttpError(400, "Не переданы все необходимые параметры");
        next(err);
    }
};


