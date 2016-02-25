var checkAuth = require('../../middleware/auth/checkAuth').checkAuth;
var findUsers = require('../searchUsers/findPeople');

var checkAuthAndActivationForResendActivation = require('../../middleware/auth/checkAuth').checkAuthAndActivationForResendActivation;
var checkAuthAndActivation = require('../../middleware/auth/checkAuth').checkAuthAndActivation;

module.exports = function(app){
    app.post('/auth/signUp', require('./signUp').post);
    app.post('/auth/signIn', require('./signIn').post);
    app.post('/auth/logout',function(req, res, next){if(!req.session.user) res.end();next()}, require('./logout').post);
	app.get('/auth/activate', require('./activate').get);
	app.post('/auth/resendActivation',  require('./resendActivation').post);

    /*
    * Непонятно насколько нужен этот метод. Пусть пока будет
    * */
    app.get('/auth/checkAuth', checkAuth, function(req, res, next){
	    next(200);

    });

    app.get('/user/find', findUsers);
	app.get('/universities/getUniversities', require('./../universities/getUniversities').get);
	app.get('/universities/getFaculties', require('./../universities/getFaculties').get);

};
