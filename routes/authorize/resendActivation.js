var User = require('../../models/User/index').User;
var authError = require('../../error').authError;
var UI = require('../../models/university').university;
var FI = require('../../models/university').faculty;
var mailNS = require('../../notifications/mail').mailNS;
var config = require("../../config");
var async = require('async');
var util = require('util');

exports.post = function(req, res, next){
	var mail = req.body.mail;
	async.waterfall([
		function(callback){
			User.getNoactivatedUserByMail(mail, callback);
		},
		function(user, callback){
			if(!user) return callback(new authError(util.format("no user found by mail %"), mail));
			callback(null, user);
		}
	], function(err, user){
		if(err) {
			res.json({result: false});
			res.end();
		}else{
			var link = config.get('general:host') + "/auth/activate?mail=%s&key=%s";
			link = util.format(link, user.auth.mail, user.activation.key);
			var message = util.format("<p>%s, вот ссылка для подтверждения почты - <a href='%s'>Подтвердить</a>",user.pubInform.name, link);
			var ns = new mailNS("Confirm password on istudentapp.ru", "", "auth", message, message);
			ns.send(user.auth.mail, function(err){
				var nsRes = {result: !err};
				res.json(nsRes);
				res.end();
				next();
			})

		}
	})
};