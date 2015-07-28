var Question  = require('../../models/Forum').Question;
var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;

exports.post = function(req, res, next){
    var aid = req.body.aid;
    var qid= req.session.qid;
    var author = req.session.user;
    Question.unlike(qid, aid, author, function(err) {
        if(err)  return next(err);
        else{
            res.sendStatus(200);
            res.end();
            return next();
        }
    });
};
