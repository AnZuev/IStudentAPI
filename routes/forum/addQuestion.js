var Question  = require('../../models/Forum').Question;
var async = require('async');

var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;

exports.post = function(req, res, next){
    var questionTitle = req.body.title;
    var questionContent = req.body.content;
    var authorName =  req.user.get('personal_information.first_name') +  " " + req.user.get('personal_information.last_name');
    var car = req.body.car || "car";
    var model = req.body.model || "model";
    var system = req.body.system|| "system";
    console.log('Вывод из добавления вопроса');
    Question.addQuestion(questionTitle,
                         questionContent,
                         req.user._id,
                         req.user.personal_information.photo_url,
                         req.user.about_experience.title,
                         authorName,
                         car,
                         model,
                         system,
        function(err, new_question) {
            if(err) {
                if(err instanceof DbError) {
                    return next(new HttpError(400, err.message))
                }
                else{
                    return next(err);
                }
            }
            console.log(new_question);
            res.send(new_question._id);
            res.end();
            return next();
    });
};
