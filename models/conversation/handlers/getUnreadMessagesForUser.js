var dbError = require('../../../error/index').dbError;


module.exports = function(userId, callback){
	this.count({
			"participants":userId,
			"messages.unread": userId
		},
		function(err, count){
			if(err) return callback(null, 0);
			else{
				return callback(null, count);
			}
		}
	)
};