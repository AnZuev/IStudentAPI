/**
 * Created by anton on 25/01/16.
 */
"use strict";

var Conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User/index').User;
var Sockets = require('../../common/sockets').sockets;



var wsError = require('../../../error').wsError;
var DbError = require(appRoot + "/error").dbError;


var Q = require('q'),
	util = require('util');



var libs = require('../libs/libs');
var log = require(appRoot + '/libs/log')(module);
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

	Q.async(function* (){
		let conversations = [];

		let contacts;
		try{

			switch (keyword.length){

				case 1:
					contacts = yield User.getContactsByOneKey(socket.request.headers.user.id, keyword[0]);
					break;
				case 2:
					contacts = yield User.getContactsByTwoKeys(socket.request.headers.user.id, keyword[0], keyword[1]);
					break;
				default:
					contacts = yield User.getContactsByTwoKeys(socket.request.headers.user.id, keyword[0], keyword[1]);
			}

			contacts.forEach(function(item){
				var obj = {
					userId: item.id,
					title: item.username,
					description: item.faculty,
					photo: item.photo,
					type: "private"
				};
				conversations.push(obj);
			});
		}catch(err){
			log.error(util.format('Произошла ошибка по время получения личных бесед', err));
		}
		let pubConversations = yield Conversation.getConvsByTitle(data.title, socket.request.headers.user.id);
		conversations = conversations.concat(pubConversations);
		if(conversations.length > 0) return cb(conversations);
		else{
			return cb(new wsError(204, "Ничего не найдено").sendError());
		}

	})().done();



};