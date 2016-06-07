var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.get = function(req, res, next){
    try {
        var documentId = mongoose.Types.ObjectId(req.query.id);
    }catch(e){
        return next(400);
    }
    DI.getDocById(documentId,function(err,result) {
        if(err) {
            if (err.code == 204) return next(new HttpError(204, err.message));
            if (err.code == 500) return next(new HttpError(500));
            else next(err);
        }
        else {
            res.json(result);
            res.end();
            next();
        }
    })
};
