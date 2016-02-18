/**
 * Created by anton on 30/09/15.
 */
var http = require('http');

module.exports = function(app){
	app.get('/service/updateAndRestart', function(req, res, next){
		var options = {
			host: "127.0.0.1",
			port: 8000,
			path: '/users/gitPull',
			method: 'GET'
		};
		res.json({"state": "done"});
		res.end();
		var request = http.request(options, function(response){
			process.exit();
		});
		request.end();
	})
};



