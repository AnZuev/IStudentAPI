/**
 * Created by anton on 30/09/15.
 */
var http = require('http');

module.exports = function(app){
	app.get('/service/stop', function(req, res, next){
		res.json({state: "done", message: "Is going to shout down"});
		res.end();
		process.exit();
	})
};



