var User = require('../../models/User').User;
var authError = require('../../error').authError;
var httpError = require('../../error').HttpError;
var log = require('../../libs/log')(module);

var UI = require('../../models/university').university;
var FI = require('../../models/university').faculty;

var async = require('async');

exports.post = function(req, res, next){
	var password, mail;
	try{
		password = req.body.password || "";
		mail = req.body.mail || "";
	}catch(e){
		throw e;
	}
	if(password.length == 0 || mail.length == 0) next(401);
	User.signIn(mail, password, function(err, user){
		if(err) {
			if((err instanceof authError) && (err.code == 110001)){
				var httperr = new httpError(405, "Почта не подтверждена. Пожалуйста, подтвердите свою почту");
				return next(httperr)
			}else if(err instanceof authError) {
				next(401)
			}else{
				log.error(err);
				return next(err);
			}
		}else{
			req.session.user = user._id;
			async.parallel([
				function(callback){
					UI.getFacultyName(user.pubInform.university, user.pubInform.faculty, callback);
				},
				function(callback){
					UI.getUniversityName(user.pubInform.university, callback);
				}
			], function(err, result){
				if(err) throw err;//return next(err);
				else{
					var userToReturn = {
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
			});
            }
        });
};