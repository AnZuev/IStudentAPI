var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var mmws = require('../../conversation/imInterface').mmws;
var wsError = require('../../../error').wsError;


var async = require('async');


exports.setAllSettings = function(socket, data, cb){
	try{
		var settings = {
			notification: data.settings.notification,
			tag: data.settings.tag
		};
		User.addImSettings(socket.request.headers.user.id, data.convId, settings, function(err, result){
			if(err) return cb(new wsError(500).sendError());
			else{
				return cb(true);
			}
		})
	}catch(e){
		return cb(new wsError(400, "No settings found in request data").sendError())
	}
};

exports.setNotification = function(socket, data, cb){
	try{
		var settings = {
			notification: data.value || false
		};
		User.addImSettings(socket.request.headers.user.id, data.convId, settings, function(err, result){
			if(err) return cb(new wsError(500).sendError());
			else{
				return cb(true);
			}
		})
	}catch(e){
		return cb(new wsError(400, "No settings found in request data").sendError())
	}
};