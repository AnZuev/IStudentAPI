var User = require('../../models/User').User;
var authError = require('../../error').authError;
var httpError = require('../../error').HttpError;
var log = require('../../libs/log')(module);

var UI = require('../../models/university').university;
var FI = require('../../models/university').faculty;

var async = require('async');

exports.get = function(req, res, next){

	async.parallel([
		function(callback){
			UI.getFacultyName(req.user.pubInform.university, req.user.pubInform.faculty, callback);
		},
		function(callback){
			UI.getUniversityName(req.user.pubInform.university, callback);
		}
	], function(err, result){
		var userToReturn;
		if(err){
			userToReturn = {
				name: req.user.pubInform.name,
				surname: req.user.pubInform.surname,
				photo:req.user.pubInform.photo,
				year: req.user.pubInform.year,
				group: req.user.pubInform.group,
				id: req.user._id
			};
			res.json(userToReturn);
			res.end();
		}
		else{
			userToReturn = {
				name: req.user.pubInform.name,
				surname: req.user.pubInform.surname,
				photo: req.user.pubInform.photo,
				year: req.user.pubInform.year,
				faculty: result[0].title,
				university: result[1].title,
				group: req.user.pubInform.group,
				id: req.user._id
			};
			res.json(userToReturn);
			res.end();
		}
		return next();
	});
};