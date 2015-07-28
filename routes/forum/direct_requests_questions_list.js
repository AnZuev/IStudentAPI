var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;



exports.get = function(req, res, next){

    res.locals.what_page_to_render = 'questions_list';
    if(req.session.user){

        console.log('пользователь авторизован');
        res.render('index_for_forum', {
            user: req.user
        });
        console.log('я тут теперь');
    }else{
        console.log('пользователь неавторизован');
        res.render('index_for_forum', {

        });
        console.log('отрисовал шаблон');
    }


    next();






};




