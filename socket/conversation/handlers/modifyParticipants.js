var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation/index').conversation;
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
	if(!data.newParticipants) return cb(new wsError(400).sendError());

	conversation.addParticipants(data.convId, socket.request.headers.user.id, data.newParticipants, function(err, result){
		if(err){
			return cb(new wsError(400).sendError())
		}else{
			if(result) return cb(true);
			else return cb(new wsError(403).sendError());
		}
	})
};



/*
 1) Пытаемся найти беседу с юзером
 2) Если найдена, смотрим админ ли наш юзер. Если да и среди удаленных участникок нет админа(то есть админ не путается сам себя удалить) - удаляем участника
 3) Если среди удаляемых участников есть админ - меняем админа на другого участника(которого нет в массиве для удаления) и удаляем
 4) Если участник не админ, но он хочет удалить только сам себя - разрешаем

 */

exports.removeParticipants = function(socket, data, cb){
	conversation.removeParticipants(data.convId, socket.request.headers.user.id, data.users, function(err, result){

		if(err){

			if(err instanceof conversationError){
				if(err.code == 403) return cb(new wsError(403, "Действие запрещено").sendError());
				else return cb(new wsError(404, "Не найден диалог").sendError());
			}else{
				return cb(new wsError(500).sendError());
			}
		}else{
			if(result) return cb(true);
			else return cb(new wsError(400, "Плохие данные").sendError());
		}
	})
};

/*
 1) Пытаемся найти беседу с юзером
 2) Если найдена, смотрим админ ли наш юзер. Если да и удаленный участник не админ(то есть админ не путается сам себя удалить) - удаляем участника
 3) Если удаляемый участник админ - меняем админа на другого участника и удаляем
 4) Если участник не админ, но он хочет удалить сам себя - разрешаем

 */

exports.exitFromConv = function(socket, data, cb){
	conversation.removeParticipants(data.convId, socket.request.headers.user.id, [socket.request.headers.user.id], function(err, result){
		if(err){
			if(err instanceof conversationError){
				if(err.code == 403) return cb(new wsError(403, "Действие запрещено").sendError());
				else return cb(new wsError(404, "Не найден диалог").sendError());
			}
			return cb(new wsError().sendError(500));
		}else{
			if(result) return cb(true);
			else return cb(new wsError().sendError(400));
		}
	})
};