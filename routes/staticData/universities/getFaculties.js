var mongoose = require("../../../libs/mongoose");
var util = require('util');
var async = require('async');

var UI = require('../../../models/university').university;

require('../../../libs/additionalFunctions/extensionsForBasicTypes');
var httpError = require('../../../error/index').HttpError;


exports.get = function(req, res, next){

	var title = req.query.title;
	var university = req.query.university;
	var err = new httpError(400, util.format("Отсутствует идентификатор университета"));
	if(!university) return next(err);
	if(title && (title.length > 0)){
		title = new RegExp(title, "ig");
		UI.getFacultiesByTitle(title, university, function(err,result){
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
		UI.getFaculties(university, function(err,result){
			if(err || result.length == 0){
				err = new httpError(204, util.format("Не найдено университетов"));
				next(err);
			}else{
				res.json(result);
				res.end();
				next();
			}
		})
	}
};