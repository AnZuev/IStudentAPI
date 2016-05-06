var dbError = require('../../../error/index').dbError;


module.exports = function(userId1, userId2, callback){

	this.findOne(
		{
			participants:{$all:[userId1, userId2], $size: 2}
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
						participants: conv.participants
					};
					return callback(null, data);
				}else{
					return callback(new dbError(null, 404, "No conversation found"))
				}
			}

		}
	);

};
