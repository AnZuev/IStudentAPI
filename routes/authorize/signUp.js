var User = require('../../models/User').User;
var httpError = require('../../error').HttpError;
var authError = require('../../error').authError;
var universityInterface = require('../../data/index').universityInfoLoader;
var dataJson = require('../../data/university.json');
var UI = require('../../models/university').university;
var FI = require('../../models/university').faculty;
var mailNS = require('../../notifications/mail').mailNS;
var config = require('../../config');

var async = require('async');
var util = require('util');

exports.post = function(req, res, next){

	try{
		var name = req.body.name.capitilizeFirstLetter();
		var surname = req.body.surname.capitilizeFirstLetter();
		var password = req.body.password;
		var studNumber = req.body.studNumber;
		var year = req.body.year;
		var faculty = req.body.faculty;
		var group = req.body.group;
		var university = req.body.university;
		var mail = req.body.mail;
	}catch(e){
		next(400);
	}

    async.waterfall([
	    function(callback){
		    UI.validateUI(university, faculty, callback);
	    },
	    function(validated, callback){
		    if(!validated) return callback(new httpError(400, "Данные не прошли валидацию"));
		    User.signUp(name, surname, group, faculty, university, year, studNumber, mail, password,callback);
	    }
    ], function(err, user){
	    if(err){
		    if(err instanceof httpError ){
			    return next(err);
		    }else if(err instanceof authError){
			    return next(new httpError(400,  err.message))
		    }else{
			    return next(err);
		    }
	    }else{
		    var link = config.get('general:host') + "/auth/activate?mail=%s&key=%s";
		    link = util.format(link, user.mail,user.key);
		    var message = util.format("<p>%s, вот ссылка для подтверждения почты - <a href='%s'>Подтвердить</a>",user.name, link);
	        var ns = new mailNS("Confirm password on istudentapp.ru", "", "auth", message, message);
		    ns.send(user.mail, function(err, result){});
		    res.json(user);
		    res.end();
		    return next();
	    }
    })

};


String.prototype.capitilizeFirstLetter = function(){
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

