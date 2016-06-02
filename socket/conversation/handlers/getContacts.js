/**
 * Created by anton on 25/01/16.
 */
'use strict';

var log = require('../../../libs/log')(module),
	Conversation = require('../../../models/conversation/index').conversation,
	User = require('../../../models/User/index').User,
	Sockets = require('../../common/sockets').sockets,
	Q = require('q');


var wsError = require('../../../error').wsError,
	dbError = require('../../../error').dbError;


/*
 1) Вызываем метод базы данных getAllContacts
 2) Если ошибка - передаем делаем wsError и отправляем
 3) Если все хорошо - отправляем массив контактов


 */
module.exports = function handler(socket, data, cb){
	Q.async(function*(){
		let contacts = yield User.getAllContacts(socket.request.headers.user.id);
		cb(contacts);
	})().done();
};


