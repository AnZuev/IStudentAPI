var dbError = require('../../../error/index').dbError;
var async = require('async');

module.exports = function(convId, userId, rawMessage, callback){
	var conversation = this;
	async.waterfall([
		function(callback){
			conversation.findOne({_id:convId, participants: userId}, callback);
		},
		function(conv, callback){
			if(!conv) return callback(new dbError(null, 400, "Беседа не найдена"));
			else{
				var participants = [];
				conv.participants.forEach(function(element, index, array){
					participants.push(element);
				});
				participants.splice(conv.participants.indexOf(userId), 1);
				var messageItem = {
					sender:userId,
					text:rawMessage.text,
					unread: participants,
					attachments: rawMessage.attachments, //TODO сделать проверку для прикрепленных документов дабы избежать возможности атак
					date: Date.now()
				};
				conv.updated = Date.now();
				conv.messages.push(messageItem);
				var errCounter = 0;
				addMessageToDialog(conv, messageItem, errCounter,function(err){
					if(err) return callback(err);
					else{ return callback(null, messageItem, conv.messages)}
				});

				if(conv.participants.length == 2){
					var tasks = [];
					tasks.push(taskToAddContact(conv.participants[0], conv.participants[1]));
					tasks.push(taskToAddContact(conv.participants[1], conv.participants[0]));
					async.parallel(tasks, function(){})
				}
			}
		}
	],callback)
};


function addMessageToDialog(conv, messageItem, errCounter, callback){
	conv.save(function(err, conv){
		if(err) {
			if(errCounter > 5) {
				return callback(new dbError(null, 500, "Произошла ошибка при добавлении сообщения " + errCounter + " раз"));
			}else{
				errCounter++;
				addMessageToDialog(conv,messageItem, errCounter, callback)
			}
		}
		else{
			return callback(null, conv)
		}
	})
}