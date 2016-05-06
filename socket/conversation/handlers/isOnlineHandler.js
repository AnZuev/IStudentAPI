var log = require('../../../libs/log')(module);
var util = require('util');

var sockets = require('../../common/sockets').sockets;
var wsError = require('../../../error').wsError;

var mongoose = require('../../../libs/mongoose');



module.exports = function(socket, data, cb){
	var userId;

	try {
		userId = mongoose.Types.ObjectId(data.userId);
	}catch(e){
		cb(new wsError(400, "Ошибка во время валидации данных").sendError());
	}
	sockets.checkIfUserOnline(userId, function(err, result){
		if(err){
			log.error(util.format(err));
			return cb(new wsError(500, "Ошибка базы данных").sendError());
		}else{
			return cb(result);
		}
	})
};