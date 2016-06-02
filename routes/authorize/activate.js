var User = require('../../models/User/index').User;
var authError = require('../../error').authError;
var dbError = require('../../error').dbError;
var UI = require('../../models/university').university;

var async = require('async');
var util = require('util');



exports.get = function(req, res, next){
	var mail = req.query.mail || "";
	var key = req.query.key || "";

	async.waterfall([
		function(callback){
			User.activate(mail, key, callback);
		},
		function(result, callback){
			if(!result) return callback(new authError(util.format("Аккаунт с почтой %s не прошел активацию", mail)));
			else{
				User.getActivatedUserByMail(mail, callback);
			}
		},
		function(user, callback){
			if(user){
				req.session.user = user._id;
				async.parallel([
					function(callback){
						UI.getFacultyName(user.pubInform.university, user.pubInform.faculty, callback);
					},
					function(callback){
						UI.getUniversityName(user.pubInform.university, callback);
					}
				], function(err, results){
					return callback(err, results, user);
				});
			}else{
				return callback(new authError(util.format('Не могу найти пользователя по почте %s, которая только что была подтверждена'), mail));
			}
		}
	], function(err, result, user){
		var userToReturn;
		if(err) {
			if(err instanceof authError) {
				res.json({result: "failed"});
				res.end();
				return next();
			}else if(err instanceof dbError && err.code != 404){
				userToReturn = {
					name: user.pubInform.name,
					surname: user.pubInform.surname,
					photo:user.pubInform.photo,
					year: user.pubInform.year,
					group: user.pubInform.group,
					id: user._id
				};
				res.json(userToReturn);
				res.end();
			}else{
				return next(err);
			}
		}
		else{
			userToReturn = {
				name: user.pubInform.name,
				surname: user.pubInform.surname,
				photo:user.pubInform.photo,
				year: user.pubInform.year,
				faculty: result[0].title,
				university: result[1].title,
				group: user.pubInform.group,
				id: user._id
			};
			res.json(userToReturn);
			res.end();
		}
		return next();
	})

};