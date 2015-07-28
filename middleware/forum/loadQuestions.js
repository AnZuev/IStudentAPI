var HttpError = require('../../error').HttpError;
var Question  = require('../../models/Forum').Question;
var makeListOfQuestions = require('../../libs/makeListOfQuestions');
var DbError = require('../../error').DbError;



module.exports = function(req, res, next){
    var car =  req.query.car;
    var model =  req.query.model;
    var system = req.query.system;
    res.locals.questions = null;
    Question.getQuestionsByCarModelSystem(car, model, system, function(err, questions){
        if(err) {
           return next(err);
        }else{
            res.locals.questions = makeListOfQuestions(questions);
            return next();
        }
    });
};
