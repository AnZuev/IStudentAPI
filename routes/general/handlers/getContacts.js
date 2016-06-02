'use strict';

var util = require('util'),
	Q = require('q');

var User = require('../../../models/User/index').User,
	DbError = require(appRoot + '/error').dbError;

exports.get = function(req, res, next){
	var keywords = req.query.q || "";
	let keyword = [];
	try{
		keywords = keywords.split(' ');
		for(var i = 0; i< keywords.length; i++){
			keyword[i] = '^' + keywords[i].toLowerCase();
			keyword[i] = new RegExp(keyword[i], 'ig');
		}
	}catch(e){
		if(keywords.length != 0) return next(400);
	}

	Q.async(function*(){
		let contacts;
		try{
			switch (keyword.length){
				case 0:
					contacts = yield User.getAllContacts(req.session.user);
					break;
				case 1:
					contacts = yield User.getContactsByOneKey(req.session.user, keyword[0]);
					break;
				case 2:
					contacts = yield User.getContactsByTwoKeys(req.session.user, keyword[0], keyword[1]);
					break;
				default:
					contacts = yield User.getContactsByTwoKeys(req.session.user, keyword[0], keyword[1]);
			}
		}catch(err){
			if(err instanceof DbError) return next(err);
			return next(new DbError(err, 500));
		}

		if(contacts.length == 0) {
			res.statusCode = 204;
		}
		res.json(contacts);
		res.end();

		return next();

	})().done();

};


