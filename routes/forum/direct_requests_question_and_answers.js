var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;
var async = require('async');



exports.get = function(req, res, next){


    if(req.session.user){
        console.log('пользователь авторизован');
        res.render('forum_question_and_answers', {
            user: req.user,
            question_and_answers: res.locals.question_and_answers,

        });
        console.log('я тут теперь');
    }else{
        console.log('пользователь неавторизован');
        res.render('forum_question_and_answers', {

        });
        console.log('отрисовал шаблон');
    }


    next();






};




