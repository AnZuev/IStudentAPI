/**
 * Created by anton on 30/09/15.
 */
var config = require('../../config');
var staticHost = config.get('general:staticHost');

var fs = require('fs');
var crypto = require('crypto');
var path = require("path");
//var privateKey = fs.readFileSync(config.get('staticServerAuth:privateKey')).toString('ascii');


var checkAuth = require('../../middleware/auth/checkAuth').checkAuth;
module.exports = function(app){
	app.get('/uploadForm', function(req, res, next){
		res.sendFile(path.join(__dirname, "../../testing/index.html"));
	});


	app.get('/download/:id', function(req, res, next) {
        var id = req.params.id;
        var data = id + req.user._id;
        var sData = crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'hex');
        res.redirect(staticHost + '/download/'+ data + '?surl='+ sData);
        next();
    });
	app.post("/uploadAvatar", checkAuth, require('./handlers/uploadAvatar').post);
	app.post("/uploadPrivatePhoto", checkAuth, require('./handlers/uploadPrivatePhoto').post);
	app.post("/uploadPrivateDocument", checkAuth, require('./handlers/uploadPrivateDocument').post);

	app.put("/uploadCompleted", require('./handlers/uploadCompleted').put);
}



