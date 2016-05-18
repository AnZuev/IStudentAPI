var util = require('util');

var UI = require('../../../models/university').university;

var httpError = require('../../../error/index').HttpError;


exports.post = function(req, res, next){

	var title = req.body.title;
	var shortTitle = req.body.shortTitle;
	var street = req.body.street;
	var city = req.body.city;
	var building = req.body.building;
	var rating = req.body.rating || 0;
	try {
		if(title.length > 0 && street.length > 0 && city.length > 0 && building.length > 0){
			UI.addUniversity(title, shortTitle, street, building, city, rating, function(err,result){
				if(err){
					next(err);
				}else{
					res.json(result);
					res.end();
					next();
				}
			})
		}else{
			throw "s";
		}
	}catch(e){
		var err = new httpError(400, util.format("Не переданы все необходимые параметры"));
		next(err);
	}

};