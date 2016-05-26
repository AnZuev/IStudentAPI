var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;

exports.get = function(req, res, next){
    SI.getAllSubjects(function(err,result) {
        if(err) {
            if (err.code == 204) return next(new HttpError(204, err.message));
            else next(err);
        }
        else {
            res.json(result);
            res.end();
            next();
        }
    })
};

