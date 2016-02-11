var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");
require('../../libs/additionalFunctions/extensionsForBasicTypes');
var dbError = require('../../error').dbError;



var universityData = require('../../data/index').universityInfoLoader;


module.exports = function(req, res, next){
    var keyword = req.query.q.split(' ');
    for(var i = 0; i< keyword.length; i++){
       keyword[i] = keyword[i].toLowerCase();
       keyword[i] = keyword[i].capitilizeFirstLetter();
    }
    switch (keyword.length){
        case 1:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                console.log(arguments);
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
	            console.log(arguments);

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
	            console.log(arguments);

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


