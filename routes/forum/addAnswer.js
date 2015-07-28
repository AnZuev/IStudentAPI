var Question = require('../../models/Forum').Question;
var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;

exports.post = function(req, res, next){
    var answer = req.body.answerContent;
    var question_id = req.body.qid;
    var userId = req.session.user;
    var from_experience = req.user.about_experience.title;
    var username =  req.user.get('personal_information.first_name') +  " " + req.user.get('personal_information.last_name');
    Question.addAnswer(question_id, answer, username, userId, from_experience, function(err, answer) {
        if(err) return next(err);
        else{
            res.send(answer);
            res.end();
            console.log(answer);
        }
    });
};
