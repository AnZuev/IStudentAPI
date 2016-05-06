var dbError = require('../../../error/index').dbError;
var async = require('async');

module.exports = function(userId1, userId2, callback){
	var conversation = this;
	async.waterfall([
		function(callback){
			conversation.getPrivateConvByParticipants(userId1, userId2, function(err, conv){
				if(err){
					if(err instanceof dbError && err.code == 404){
						return callback(null, null);
					}
				}else{
					return callback(null, conv);
				}
			})
		},
		function(conv, callback) {
			if (conv) return callback(null,conv);
			else {

				var users = [];
				users.push(userId1);
				users.push(userId2);
				var newConv = new conversation({
					participants: users
				});
				newConv.save(function (err, conv) {
					if (err) return callback(new dbError(err, null, null));
					else {
						return callback(null, conv);
					}
				})
			}
		}
	], callback);
};