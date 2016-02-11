var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");
require('../../libs/additionalFunctions/extensionsForBasicTypes');
var dbError = require('../../error').dbError;



var universityData = require('../../data/index').universityInfoLoader;


module.exports = function(req, res, next){
    var keywords = req.query.q.split(' ');
	var keyword = [];
    for(var i = 0; i< keywords.length; i++){
       keyword[i] = keywords[i].toLowerCase();
       keyword[i] = new RegExp(keyword[i].capitilizeFirstLetter(), 'i');
    }
	console.log(keyword);
    switch (keyword.length){
        case 1:
            User.getPeopleByOneKey(keyword[0], function(err, users){
	            if(err) {
	                if((err instanceof dbError) && (err.code == 204)) {
		                res.statusCode = 204;
		                res.json([]);
		                res.end();
		                return next();
	                }
                    else return next(err);
                }
                else{
	                var result = [];
	                users.forEach(function(element){
		                result.push(universityData.makeContact(element));
	                });
                    res.json(result);
                    return next();
                }
            });
            break;
        case 2:
            User.getPeopleByTwoKeys(keyword[0], keyword[1], function(err, users){

	            if(err) {
		            if((err instanceof dbError) && (err.code == 204)) {
			            res.statusCode = 204;
			            res.json([]);
			            res.end();
			            return next();
		            }
		            else return next(err);
	            }
                else{
	                var result = [];
	                users.forEach(function(element){
		                result.push(universityData.makeContact(element));
	                });
	                res.json(result);
	                return next();
                }
            });
            break;
        case 3:
            User.getPeopleByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){

	            if(err) {
		            if((err instanceof dbError) && (err.code == 204)) {
			            res.statusCode = 204;
			            res.json([]);
			            res.end();
			            return next();
		            }
		            else return next(err);
	            }
                else{
	                var result = [];
	                users.forEach(function(element){
		                result.push(universityData.makeContact(element));
	                });
	                res.json(result);
	                return next();

                }
            });
            break;
        default:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
	                var result = [];
	                users.forEach(function(element){
		                result.push(universityData.makeContact(element));
	                });
	                res.json(result);
	                return next();

                }
            })
    }
};


