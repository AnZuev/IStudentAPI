var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var mmws = require('../../conversation/imInterface').mmws;
var wsError = require('../../../error').wsError;


var async = require('async');


module.exports = function(data, socket, cb){
	conversation.readMessages(data.convId, socket.request.headers.user.id, function(err, result, conv){
		if(err) {
			cb(new wsError(500).sendError());
		}
		else{
			if(result){
				var mmwsItem = new mmws(data.convId, socket.request.headers.user.id, {}, "readMessages", {date: Date.now()});
				conv.participants.splice(conv.participants.indexOf(socket.request.headers.user.id), 1);
				mmwsItem.sendEventToGroup(conv.participants);
			}else{
				cb(new wsError(400).sendError());
			}
		}
	})
};