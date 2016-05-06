var dbError = require('../../../error/index').dbError;


module.exports = function(convId, userId,callback){
	this.findOne(
		{
			_id:convId,
			participants:userId
		},
		{
			messages:{
				$slice:-20
			}
		},
		function(err, conv){
			if(err) return callback(new dbError(err));
			else{
				var data;
				if(conv){
					data = {
						_id: conv._id,
						messages:conv.messages,
						participants: conv.participants,
						photo: conv.group.photo,
						title:conv.group.title
					};
					return callback(null, data);
				}else{
					return callback(new dbError(null, 404, "No conversation found"))
				}
			}

		}
	)
};