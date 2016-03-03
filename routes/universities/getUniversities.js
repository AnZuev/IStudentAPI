var mongoose = require("../../libs/mongoose");
var util = require('util');
var async = require('async');

var UI = require('../../models/university').university;

require('../../libs/additionalFunctions/extensionsForBasicTypes');
var httpError = require('../../error/index').HttpError;

exports.get = function(req, res, next){
	var title = req.query.title;
	var format = req.query.format;
	if(format == "short"){
		format = 1;
	}else{
		format = 0;
	}

	if(title && (title.length > 0)){
		title = new RegExp(title, "ig");
		UI.getUniversitiesByTitle(title, format, function(err,result){
			if(err || result.length == 0){
				err = new httpError(204, util.format("Не найдено университетов по запросу %s", req.query.title));
				next(err);
			}else{
				res.json(result);
				res.end();
				next();
			}
		})
	}else{
		UI.getUniversities(format, function(err, result){
			if(err || (result.length == 0)){
				err = new httpError(204, util.format("Не найдено университетов"));
				return next(err);
			}else{
				res.json(result);
				res.end();
				return next();
			}
		})
	}
};