var mongoose = require("../../libs/mongoose");
var util = require('util');

var User = require('../../models/User/index').User;




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

	Q.async(function*(){
		let contacts;
		switch (keyword.length){
			case 1:
				contacts = yield User.getContactsByOneKey();

		}
		res.json(contacts);
		return next();

	})().done();
/*
	switch (keyword.length){
		case 1:

			/!*User.getContactsByOneKey(req.session.user, keyword[0], function(err, users){
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
			});*!/
			break;
		case 2:
			User.getContactsByTwoKeys(req.session.user, keyword[0], keyword[1], function(err, users){

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
			User.getContactsByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){

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
			User.getContactsByOneKey(keyword[0], function(err, users){
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
*/
};


