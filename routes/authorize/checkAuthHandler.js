

var UI = require('../../models/university').university;


var async = require('async');

exports.get = function(req, res, next){
	async.parallel([
		function(callback){
			UI.getFacultyName(req.user.university, req.user.faculty, callback);
		},
		function(callback){
			UI.getUniversityName(req.user.university, callback);
		}
	], function(err, result){
		var userToReturn;
		if(err){
			userToReturn = {
				name: req.user.name,
				surname: req.user.surname,
				photo:req.user.photo,
				year: req.user.year,
				group: req.user.group,
				id: req.user._id
			};
			res.json(userToReturn);
			res.end();
		}
		else{
			userToReturn = {
				name: req.user.name,
				surname: req.user.surname,
				photo:req.user.photo,
				year: req.user.year,
				group: req.user.group,
				id: req.user._id,
				faculty: result[0].title,
				university: result[1].title
			};

			res.json(userToReturn);
			res.end();
		}
		return next();
	});
};