var mongoose = require("../../libs/mongoose");
var util = require('util');
var async = require('async');

var User = require('../../models/User/index').User;
var UI = require('../../models/university').university;


var taskToMakeContact = require('../../models/university').taskToMakeContact;
require('../../libs/additionalFunctions/extensionsForBasicTypes');
var dbError = require('../../error').dbError;



module.exports = function(req, res, next){
    var keywords = req.query.q.split(' ');
	var keyword = [];

	try{
		for(var i = 0; i< keywords.length; i++){
			keyword[i] = '^' + keywords[i].toLowerCase();
			keyword[i] = new RegExp(keyword[i], 'ig');
		}
	}catch(e){
		return next(400);
	}

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
		            var tasks = [];
		            users.forEach(function(element){
			            tasks.push(taskToMakeContact(element));
		            });
		            async.parallel(tasks, function(err, results){
			            res.json(results);
			            return next();
		            })
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
		            var tasks = [];
		            users.forEach(function(element){
			            tasks.push(taskToMakeContact(element));
		            });
		            async.parallel(tasks, function(err, results){
			            res.json(results);
			            return next();
		            })
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
	                var tasks = [];
	                users.forEach(function(element){
		                tasks.push(taskToMakeContact(element));
	                });
		            async.parallel(tasks, function(err, results){
			            res.json(results);
			            return next();
		            })


                }
            });
            break;
        default:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) throw err;//return next(err);
                else{
	                var tasks = [];
	                users.forEach(function(element){
		                tasks.push(taskToMakeContact(element));
	                });
	                async.parallel(tasks, function(err, results){
		                console.log(results);
		                res.json(results);
		                return next();
	                })

                }
            })
    }
};


