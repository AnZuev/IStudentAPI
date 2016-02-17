var checkAuth = require('../../middleware/auth/checkAuth').checkAuth;
var findUsers = require('../searhUsers/findPeople');


module.exports = function(app){
    app.post('/auth/signUp', require('./signUp').post);
    app.post('/auth/signIn', require('./signIn').post);
    app.post('/auth/logout', require('./logout').post);


    /*
    * Непонятно насколько нужен этот метод. Пусть пока будет
    * */
    app.get('/auth/checkAuth', checkAuth, function(req, res, next){
	    next(200);
    });

    app.get('/user/find', findUsers);

}
