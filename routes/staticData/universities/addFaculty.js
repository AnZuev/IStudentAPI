var mongoose = require("../../../libs/mongoose");
var util = require('util');
var async = require('async');

var UI = require('../../../models/university').university;

require('../../../libs/additionalFunctions/extensionsForBasicTypes');
var httpError = require('../../../error/index').HttpError;


exports.post = function(req, res, next){
	var err;
	try{
		var title = req.body.title;
		var university = mongoose.Types.ObjectId(req.body.university);
	}catch(e){
		err = new httpError(400, util.format("Неверное значение идентификатора университета %s", req.body.university));
		return next(err);
	}

	if(title.length == 0 ){
		err = new httpError(400, util.format("Для добавления факультета необходимо название"));
		return next(err);
	} else{
		var faculty = {title: title};

		UI.addFacultiesToUniversity(university, [faculty], function(err,result){
			if(err){
				var error = new httpError(400, util.format("Ошибка при добавлении %s", err.message));
				next(error);
			}else{
				res.statusCode = 201;
				res.json({created: true});
				res.end();
				next();
			}
		})
	}
};