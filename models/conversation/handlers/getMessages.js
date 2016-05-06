var dbError = require('../../../error/index').dbError;


module.exports = function(convId, userId, lastMessage, callback){
	this.aggregate(
		{
			$match:{
				_id: mongoose.Types.ObjectId(convId),
				participants: mongoose.Types.ObjectId(userId)
			}
		},
		{
			$project:{
				_id: "$_id",
				messages: "$messages"
			}
		},
		{
			$unwind: "$messages"
		},
		{
			$match:{
				"messages.date":{$lt:lastMessage}
			}
		},
		{
			$group:{
				"_id": "$_id",
				messages: {'$push': '$messages'}
			}
		},
		function(err, conv){
			conv = conv[0];
			if(err){
				return callback(new dbError(err));
			}else{
				if(conv){
					return callback(err, {convId: conv._id, messages:conv.messages});
				}else{
					return callback(new dbError(null, 204));
				}
			}
		}
	)


};