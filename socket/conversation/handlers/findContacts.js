var User = require('../../../models/User').User;
require('../../../libs/additionalFunctions/extensionsForBasicTypes');

var universityData = require('../../../data/index').universityInfoLoader;


var log = require('../../../libs/log')(module);
var wsError = require('../../../error').wsError;

module.exports = function(socket, data, cb){
	var keywords = data.query.split(' ');
	var keyword = [];

	for(var i = 0; i< keywords.length; i++){
		keyword[i] = '^' + keywords[i].toLowerCase();
		keyword[i] = new RegExp(keyword[i], 'ig');
	}

	switch (keyword.length){
		case 1:
			User.getContactsByOneKey(socket.request.headers.user.id, keyword[0], function(err, users){
				if(err) {
					return cb(new wsError().sendError());
				}
				else{
					var res = [];
					users.forEach(function(element){
						res.push(universityData.makeContact(element));
					});
					cb(res);
				}
			});
			break;
		case 2:
			User.getContactsByTwoKeys(socket.request.headers.user.id, keyword[0], keyword[1], function(err, users){
				if(err) {
					return cb(new wsError().sendError());
				}
				else{
					var res = [];
					users.forEach(function(element){
						res.push(universityData.makeContact(element));
					});
					cb(res);
				}
			});
			break;
		case 3:
			User.getContactsByThreeKeys(socket.request.headers.user.id, keyword[0],keyword[1], keyword[2], function(err, users){
				if(err) {
					return cb(new wsError().sendError());
				}
				else{
					var res = [];
					users.forEach(function(element){
						res.push(universityData.makeContact(element));
					});
					cb(res);
				}
			});
			break;
		default:
			User.getContactsByOneKey(socket.request.headers.user.id, keyword[0], function(err, users){
				if(err) {
					return cb(new wsError().sendError());
				}
				else{
					cb(users);
				}
			})
	}
};


