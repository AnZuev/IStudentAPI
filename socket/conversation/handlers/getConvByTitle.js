/**
 * Created by anton on 25/01/16.
 */

var conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var UI = require('../../../models/university').university;



var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require("async");


var libs = require('../libs/libs');
var taskToMakeContact = require('../../../models/university').taskToMakeContact;
var log = require('../../../libs/log')(module);
var util = require('util');

/*
 1) Ищем личные диалоги по имени второго юзера
 2) Ищем групповые диалоги по названию
 3) Объединяем
 4) Отдаем юзеру



 */
module.exports = function(socket, data, cb){
	var keyword = data.title.split(' ');
	for(var i = 0; i< keyword.length; i++){
		keyword[i] = '^' + keyword[i].toLowerCase();
		keyword[i] = new RegExp(keyword[i], 'ig');
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
							var tasks = [];
							users.forEach(function(element){
								tasks.push(taskToMakeContact(element));
							});
							async.parallel(tasks, function(err, results){
								callback(null, results);
							});
						}
					});

					break;
				case 2:
					User.getContactsByTwoKeys(socket.request.headers.user.id, keyword[0], keyword[1], function(err, users){
						if(err) {
							if(err instanceof dbError) return callback(null, []);
							else return callback(null);
						}else{
							var tasks = [];
							users.forEach(function(element){
								tasks.push(taskToMakeContact(element));
							});
							async.parallel(tasks, function(err, results){
								callback(null, results);
							});
						}
					});
					break;
				case 3:
					User.getContactsByThreeKeys(socket.request.headers.user.id, keyword[0],keyword[1], keyword[2], function(err, users){
						if(err) {
							if(err instanceof dbError) return callback(null, []);
							else return callback(null);
						}else{
							var tasks = [];
							users.forEach(function(element){
								tasks.push(taskToMakeContact(element));
							});
							async.parallel(tasks, function(err, results){
								callback(null, results);
							});
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
					convs.forEach(function(element){
						convs.settings = null;
						for(var i = 0; i < socket.request.headers.user.settings.im.length; i++){
							if(socket.request.headers.user.settings.im[i].convId == element._id){
								element.settings = req.settings.im[i];
								break;
							}
						}
					});
					return callback(null, convs);
				}
			})
		}
	], function(err, results){
		if(err) throw err;
		else{
			var conversations = [];
			results[0].forEach(function(element){
				var obj = {
					userId: element._id,
					title: element.username,
					description: element.about,
					photo: element.photo,
					type: "private"
				};
				conversations.push(obj);
			});
			conversations = conversations.concat(results[1]);
			if(conversations.length > 0) return cb(conversations);
			else{
				return cb(new wsError(204, "Ничего не найдено").sendError());
			}
		}
	})


};