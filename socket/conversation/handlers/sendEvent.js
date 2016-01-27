var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var nsItem = require('../../notificationService/nsInterface').nsItem;
var mmws = require('../../conversation/imInterface').mmws;

var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require('async');


module.exports = function(socket, data, eventType){
	async.waterfall([
		function(callback){
			conversation.getConvById(data.convId, socket.request.headers.user.id, callback);
		},
		function(conv, callback){

			var mmwsItem = new mmws( data.convId, socket.request.headers.user.id, {}, eventType, {});

			conv.participants.splice(conv.participants.indexOf(socket.request.headers.user.id), 1);

			mmwsItem.sendEventToGroup(conv.participants);
			callback(null)
		}
	], function(err, result){
	})
};