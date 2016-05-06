var dbError = require('../../../error/index').dbError;


module.exports = function(convId, userId, callback){
	var conversation = this;
	async.waterfall([
		function(callback){
			conversation.findOne({
				_id: convId,
				participants:userId,
				"messages.unread": userId
			}, callback);
		},
		function(conv, callback){
			if(!conv) return callback(null, false);
			try{
				conv.messages.forEach(function(element){
					element.unread.splice(element.unread.indexOf(userId), 1);   /* TODO подумать насчет того, что эта операция может блокировать поток выполенения ноды*/
				});
				conv.save(function(err){
					if(err){
						return callback(new dbError(err, null, null));
					}else{
						return callback(null, true, conv);
					}
				})
			}catch(e){
				return callback(null, false);
			}
		}
	], callback);
};