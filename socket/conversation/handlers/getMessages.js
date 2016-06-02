/**
 * Created by anton on 25/01/16.
 */

var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User/index').User;
var sockets = require('../../common/sockets').sockets;


var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;



/*
 1) Вызываем метод базы данных getMessages
 2) Если ошибка - возвращаем wsError c кодом 400
 3) Если беседа не найдена  - возвращаем  wsError с кодом 403
 4) Если длина сообщение равна 0 - возвращаем wsError c кодом 204
 5) В противном случае отдаем conv


 */
module.exports = function(socket, data, cb){
	var lastMessage;
	try{
		lastMessage = new Date(data.lastMesssage);
		conversation.getMessages(data.convId, socket.request.headers.user.id, lastMessage , function(err, conv){
			if(err) return cb(new wsError(400).sendError());
			else{
				if(conv){
					if(conv.messages.length == 0) return cb(new wsError(204, "No messages"));
					else {
						conv.messages = require('../libs/libs').addDateAndServiceMessages(conv.messages);
						return cb(conv);
					}
				}else{
					return cb(new wsError(403, "Forbidden"))
				}

			}
		});
	}catch(e){
		return cb(new wsError(400, "Parse date error"))
	}

};