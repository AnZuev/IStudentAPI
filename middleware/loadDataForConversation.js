var User = require('../models/User').User;
var conversation = require('../models/conversation').conversation;
var dbError = require('../error/index').dbError;
var log = require('../libs/log')(module);

var async = require('async');

var conversationLibs = require('../socket/conversation/libs/libs');

var numberConvToReturn = require('../config/index').get("im:convsToReturn");

module.exports = function(req, res, next){

	async.waterfall([
		function(callback){
			conversation.getLastConversations(req.session.user, numberConvToReturn, callback);
		},
		function(convs, callback){
			var tasks = [];
			var task;
			convs.forEach(function(conv){
				if(conv.participants.length > 2) task = function(callback){conversationLibs.loadGroupConvInfo(conv, req.session.user, callback)};
				else task = function(callback){conversationLibs.loadPrivateConvInfo(conv, req.session.user, callback)};
				tasks.push(task);
			});
			async.parallel(tasks, callback);
		},
		function(convs, callback){
			convs.forEach(function(conv){
				conv.unreadMessages =  false;
				for(var i = 0; i< conv.messages.length; i++){
					if(conv.messages[i].service || conv.messages[i].type == "date") continue;
					if(conv.messages[i].sender != req.session.user){
						conv.unreadMessages = (conv.messages[i].unread.indexOf(req.session.user) >= 0);
						break;
					}
				}
			});
			req.convs = convs;
			callback(null);
		},
		function(callback){
			conversation.getUnreadMessagesForUser(req.session.user, function(err, count){
				req.notifications = {
					newMessages:count
				};
				return callback(null)
			})
		},
		function(callback){
			//получить еще что-то
			callback(null);
		}

	],function(err, convs){
		if(err){
			next(err);
		}else{
			next();
		}
	});

};
