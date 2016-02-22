var HttpError = require('../../error').HttpError;
var authError = require('../../error').authError;
var dbError = require('../../error').dbError;

var util = require('util');


exports.checkAuth = function(req, res, next){
    if(!req.session.user) return next(new HttpError(401, "Вы не авторизованы"));
    return next();
};

exports.checkAuthAndRedirect = function(req, res, next){
	if(!req.session.user) {
		res.status = 401;
		res.redirect("/");
		res.end();
		next();
	}
	return next();
};

exports.checkAuthAndActivation = function(req, res, next){
	if(!req.session.user) return next(new HttpError(401, "Вы не авторизованы"));
	else{
		User.checkActivation(req.session.user, function(err, activated){
			if(err){
				if(err instanceof dbError){
					return next(new HttpError(400, "No users found"));
				}else{
					next(err);
				}
			}else{
				if(activated){
					return next();
				}else{
					var httpError = new HttpError(405, "Почта не подтверждена. Пожалуйста, подтвердите свою почту");
					return next(httpError)
				}
			}
		})
	}
};

exports.checkAuthAndActivationForResendActivation = function(req, res, next){
	if(!req.session.user) return next(new HttpError(401, "Вы не авторизованы"));
	else{
		User.checkActivation(req.session.user, function(err, activated){
			if(err){
				if(err instanceof dbError){
					return next(new HttpError(400, "No users found"));
				}else{
					next(err);
				}
			}else{
				if(!activated){
					return next();
				}else{
					var httpError = new HttpError(400, "Почта уже подтверждена");
					return next(httpError);
				}
			}
		})
	}
};