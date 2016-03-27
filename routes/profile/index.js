/**
 * Created by anton on 30/09/15.
 */

var config = require('../../config');

var checkAuth = require('../../middleware/auth/checkAuth').checkAuth;
module.exports = function(app){
	app.post('/profile/changeAvatar', checkAuth, require('./handlers/changePhoto').post);
}



