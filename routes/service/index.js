/**
 * Created by anton on 30/09/15.
 */
var httpError = require('../../error').HttpError;
var User = require('../../models/User').User;
var util = require("util");
module.exports = function(app){
	app.get('/service/stop', function(req, res, next){
		res.json({state: "done", message: "Is going to shout down"});
		res.end();
		process.exit();
	});
	app.get('/service/attachSession', function(req,res, next){
		if(req.session.user) {
			var error = new httpError(400, util.format("Session already attached to user %s",  req.session.user));
			return next(error);
		}else{
			User.findOne({"auth.mail": req.query.mail}, function(err, user){
				if(err){
					return next(err)
				}else{
					if(user){
						req.session.user = user._id;
						var str = util.format("Session has been attached to user %s", user._id);
						res.send(str);
						res.end();
						return next()
					}
				}

			})
		}
	})
};



