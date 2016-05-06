var User = require('../../models/User').User;
var httpError = require('../../error').HttpError;

var mailNS = require('../../notifications/mail').mailNS;
var config = require('../../config');

var mongoose = require('mongoose');
var async = require('async');
var util = require('util');

exports.post = function(req, res, next){

	if(!req.body.mail) {
		next(new httpError(400, "Отсутствует параметр mail"));
		return;
	}
	var mail = req.body.mail;
	User.setKeyToChangePassword(mail, function(err, user){
		console.log(arguments);
		if(!user) return next(500);
		var link = config.get('general:host') + "/auth/setNewPassword?key=%s&mail=%s";
		link = util.format(link, user.key,user.mail);
		var message = util.format("<p>Ссылка для восстановления пароля - <a href='%s'>Изменить пароль</a>", link);
		var ns = new mailNS("Восстановление пароля на istudentapp.ru", "", "restorePassword", message, message);
		ns.send(user.mail, function(err, result){});
		res.json([]);
		res.end();
		return next();
	});


};

