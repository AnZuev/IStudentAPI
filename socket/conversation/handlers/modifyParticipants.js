var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;
var conversationError = require('../../../error').conversationError;



var async = require('async');

/*
	1) Пытаемся найти беседу с юзером в админах либо беседу, где состоит отправитель и отправитель является владельцем
	2) Если найдена - добавляем
	3) Если не найдено - не добавлям и возвращаем ошибку 400
 */

exports.addParticipants = function(socket, data, cb){
	if(!data.newParticipants) return cb(new wsError(400).sendError())

	conversation.addParticipants(data.convId, socket.request.headers.user.id, data.newParticipants, function(err, conv){

		if(err){
			throw err;
			return cb(new wsError(400).sendError())
		}else{
			if(conv) return cb(true);
			else return cb(false);
		}
	})
};



/*
 1) Пытаемся найти беседу с юзером
 2) Если найдена, смотрим админ ли наш юзер. Если да и удаленный участник не админ(то есть админ не путается сам себя удалить) - удаляем участника
 3) Если удаляемый участник админ - 400
 4) Если участник не админ, но он хочет удалить сам себя - разрешаем

 */

exports.removeParticipant = function(socket, data, cb){
	conversation.removeParticipant(data.convId, socket.request.headers.user.id, data.userId, function(err, conv){
		if(err){
			if(err instanceof conversationError){
				if(err.code == 403) return cb(new wsError(403, "Действие запрещено").sendError());
				else return cb(new wsError(400, "Не найден диалог либо запрещенное действие").sendError());
			}
			return cb(new wsError().sendError())
		}else{
			if(conv) return cb(true);
			else return cb(false);
		}
	})
};