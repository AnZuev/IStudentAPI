var HttpError = require('../../error').HttpError;
var Question  = require('../../models/Forum').Question;


module.exports = function(req, res, next){
   req.session.qui = req.query.qid;
   Question.load(req.query.qid, function(err, question){
      if(err) {
           if(err instanceof HttpError){
                return next(new HttpError(404));
           }else{
                return next(new HttpError(500));
           }
      }
        res.locals.question = question;

        return next();
   });

};
