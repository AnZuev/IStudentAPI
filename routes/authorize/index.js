var checkAuth = require('../../middleware/auth/checkAuth').checkAuth;
var findUsers = require('../searchUsers/findPeople');

var checkAuthAndActivation = require('../../middleware/auth/checkAuth').checkAuthAndActivation;
var checkPasswordToken = require('../../middleware/auth/checkPasswordToken').checkPasswordToken;


module.exports = function(app){
    app.post('/auth/signUp', require('./signUp').post);
    app.post('/auth/signIn', require('./signIn').post);
    app.post('/auth/logout',function(req, res, next){if(!req.session.user) res.end();next()}, require('./logout').post);
	app.get('/auth/activate', require('./activate').get);
	app.post('/auth/resendActivation',  require('./resendActivation').post);
	app.post('/auth/forgotPassword', require('./forgotPassword').post);
	app.get('/auth/setNewPassword', checkPasswordToken, require('./setNewPassword').get);
	app.post('/auth/setNewPassword', checkPasswordToken, require('./setNewPassword').post);

	/*
	* Непонятно насколько нужен этот метод. Пусть пока будет
	* */
    app.get('/auth/checkAuth', checkAuthAndActivation, require('./checkAuthHandler').get);

    app.get('/user/find', findUsers);

};
