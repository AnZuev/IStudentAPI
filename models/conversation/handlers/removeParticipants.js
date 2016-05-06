var dbError = require('../../../error/index').dbError;
var async = require('async');
var conversationError = require('../../../error/index').conversationError;


module.exports = function(convId, userId, removedUsers, callback){
	var conversation = this;
	async.waterfall([
		function(callback){
			conversation.findOne(
				{
					_id:convId
				},
				callback);
		},
		function(conv, callback){
			if(conv){
				if(userId == conv.group.owner.toString()){
					if(removedUsers.indexOf(userId) >= 0){
						var newOwner;
						for(var i = 0; i < conv.participants.length; i++){
							if(removedUsers.indexOf(conv.participants[i]) < 0) {
								newOwner = conv.participants[i];
								break;
							}
						}
						conv.update(
							{
								$pull:{
									participants:{$in:removedUsers}
								},
								owner: newOwner
							}, function(err, res){
								if(err) callback(new dbError(err, null, null));
								else{
									if(res.nModified > 0){
										return callback(null, true);
									}else{
										return callback(null, false);
									}
								}
							});
					}else{
						conv.update(
							{
								$pull:{
									participants:{$in:removedUsers}
								}
							}, function(err, res){
								if(err) callback(new dbError(err, null, null));
								else{
									if(res.nModified > 0){
										return callback(null, true);
									}else{
										return callback(null, false);
									}
								}
							});
					}
				}else if(removedUsers.length == 0  && userId == removedUsers[0]){

					conv.update({$pull:{participants:{$in:userId}}}, function(err, res){
						if(err) callback(new dbError(err, null, null));
						else{
							if(res.nModified > 0){
								return callback(null, true);
							}else{
								return callback(null, false);
							}
						}
					});

				}else{
					callback(new conversationError(403, "Действие запрещено"));
				}
			}else{
				return callback(new conversationError(404, "Не найден диалог"));
			}
		}
	],callback);

};