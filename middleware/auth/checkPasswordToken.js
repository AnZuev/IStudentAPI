var HttpError = require('../../error').HttpError;
var authError = require('../../error').authError;
var dbError = require('../../error').dbError;

var util = require('util');
var User = require('../../models/User/index').User;


exports.checkPasswordToken = function(req, res, next){
	try{
		var mail = req.query.mail || req.body.mail;
		var key = req.query.key || req.body.key;
		if(mail.length > 0 && key.length > 0){
			User.checkPasswordChangeToken(mail, key, function(err, res){
				if(res){
					return next()
				}else{
					return next(new HttpError(403, util.format("Не найдено связки %s c %s", mail, key)));
				}
			})
		}else{
			return next(400);
		}
	}catch(e){
		return next(400);
	}

};