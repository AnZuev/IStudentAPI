var checkAuthAndActivation = require(appRoot + '/middleware/auth/checkAuth').checkAuthAndActivation;
module.exports = function(app){
    app.post('/general/feedback', require('./handlers/feedback').post);
	app.get('/general/getContacts',  checkAuthAndActivation, require('./handlers/getContacts').get);
};
