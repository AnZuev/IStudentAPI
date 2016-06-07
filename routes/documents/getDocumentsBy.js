var DI = require(appRoot+'/models/documents').document;
var HttpError = require(appRoot+'/error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.get = function(req, res, next){
    var title = req.query.title;
    // title = '^' + title;
    // title = new RegExp(title, "i");
    // var context = req.query.context;
    // console.log(title);
    DI.getDocsBy(title,req.query,function(err,result) {
        if(err) {
            if (err.code == 204) return next(new HttpError(204, err.message));
            // if (err.code == 405) return next(new HttpError(405, "Your account hasn't been activated yet"));
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
