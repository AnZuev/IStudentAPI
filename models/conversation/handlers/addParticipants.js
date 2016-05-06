var dbError = require('../../../error/index').dbError;


module.exports = function(convId, userId, invited, callback){
	this.findOneAndUpdate(
		{
			_id:convId,
			participants: userId
		},
		{
			$addToSet: {
				participants: { $each: invited }
			}
		}, function(err, conv){
			if(err) return callback(new dbError(err));
			else{
				if(!conv){
					callback(null, false);
				}else{
					callback(null, true);
				}
			}
		})
};