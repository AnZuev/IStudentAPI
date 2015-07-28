exports.get = function(req, res, next){

    res.locals.what_page_to_render = 'company';
    res.locals.company_name = req.params.company_name.replace(/_/g, " ");

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

