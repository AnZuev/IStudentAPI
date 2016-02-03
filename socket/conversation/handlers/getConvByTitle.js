/**
 * Created by anton on 25/01/16.
 */

var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require("async");


var libs = require('../libs');
var universityInterface = require('../../../data/index').universityInfoLoader;
/*
 1) Ищем личные диалоги по имени второго юзера
 2) Ищем групповые диалоги по названию
 3) Объединяем
 4) Отдаем юзеру



 */
module.exports = function(socket, data, cb){
	var keyword = data.title.split(' ');
	for(var i = 0; i< keyword.length; i++){
		keyword[i] = keyword[i].toLowerCase();
		keyword[i] = keyword[i].capitilizeFirstLetter();
	}

	async.parallel([
		function(callback){
			switch (keyword.length){
				case 1:

					User.getContactsByOneKey(socket.request.headers.user.id, keyword[0], function(err, users){

						if(err) {
							if(err instanceof dbError) return callback(null, []);
							else return callback(null);
						}else{
							var usersToReturn = [];
							users.forEach(function(item){
								var userToReturn = {
									student: item.student,
									group: item.group,
									description: universityInterface.getUniversityName(item.university) + ", " + universityInterface.getFacultyName(item.university, item.faculty) + ", " + item.year + " курс",
									photo: item.photo,
									id: item._id,
									type: "private"
								};
								usersToReturn.push(userToReturn);
							});
							return callback(null, usersToReturn);
						}
					});

					break;
				case 2:
					User.getContactsByTwoKeys(socket.request.headers.user.id, keyword[0], keyword[1], function(err, users){
						if(err) {
							if(err instanceof dbError) return callback(null, []);
							else return callback(null);
						}else{
							var usersToReturn = [];
							users.forEach(function(item){
								var userToReturn = {
									student: item.student,
									group: item.group,
									description: universityInterface.getUniversityName(item.university) + ", " + universityInterface.getFacultyName(item.university, item.faculty) + ", " + item.year + " курс",
									photo: item.photo,
									id: item._id,
									type: "private"
								};
								usersToReturn.push(userToReturn);
							});
							return callback(null, usersToReturn);
						}
					});
					break;
				case 3:
					User.getContactsByThreeKeys(socket.request.headers.user.id, keyword[0],keyword[1], keyword[2], function(err, users){
						if(err) {
							if(err instanceof dbError) return callback(null, []);
							else return callback(null);
						}else{
							var usersToReturn = [];
							users.forEach(function(item){
								var userToReturn = {
									student: item.student,
									group: item.group,
									description: universityInterface.getUniversityName(item.university) + ", " + universityInterface.getFacultyName(item.university, item.faculty) + ", " + item.year + " курс",
									photo: item.photo,
									_id: item._id,
									type: "private"
								};
								usersToReturn.push(userToReturn);
							});
							return callback(null, usersToReturn);
						}
					});
					break;
				default:
					return callback(null, []);
			}
		},
		function(callback){

			conversation.getConvsByTitle(data.title, socket.request.headers.user.id, function(err, convs){
				if(err) {
					if(err instanceof dbError) return callback(null, []);
					else return callback(null);
				}else{
					return callback(null, convs);
				}
			})
		}
	], function(err, results){
		if(err) throw err;
		else{
			var conversations = [];
			conversations.concat(results[0]).concat(results[1]);
			if(conversations.length > 0) return cb();
			else{
				return cb(new wsError(204, "Ничего не найдено").sendError());
			}
		}
	})


};