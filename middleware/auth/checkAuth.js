var HttpError = require('../../error').HttpError;

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