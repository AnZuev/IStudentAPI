var dbError = require('../../../error/index').dbError;


module.exports = function(title, userId, callback){

	this.aggregate([
		{
			$match:
			{
				"group.title": {$regex: title},
				"participants": mongoose.Types.ObjectId(userId)
			}
		},
		{
			$project:
			{
				title: "$group.title",
				photo: "$group.photo",
				type: {$concat:["group"]},
				lastMessage: {$slice: ["$messages", -1]}
			}
		},
		{
			$unwind: "$lastMessage"
		},
		{
			$project:
			{
				title: "$title",
				photo: "$photo",
				type: "$type",
				lastMessage: "$lastMessage.text"
			}
		},
		{ $limit : 15 },
		{
			$sort:{updated:1}
		}
	], function(err, convs){
		if(err) throw err;
		if(convs.length == 0){
			return callback(new dbError(null, 204, null));
		}else{
			return callback(null, convs);
		}
	})
};