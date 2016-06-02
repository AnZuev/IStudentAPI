var User = require('../../models/User/index').User;
var authError = require('../../error').authError;
var dbError = require('../../error').dbError;
var UI = require('../../models/university').university;

var async = require('async');
var util = require('util');



exports.get = function(req, res, next){
	var mail = req.query.mail || "";
	var key = req.query.key || "";


}

exports.post = function(req, res, next){
	var mail = req.body.mail || "";
	var key = req.body.key || "";
	var password = req.body.password;
	User.setNewPassword(mail, key, password, function(err, result){
		if(result){
			res.json({});
			res.end();
			next();
		}else{
			next(403);
		}
	})
}