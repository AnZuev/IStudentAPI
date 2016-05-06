var dbError = require('../../../error/index').dbError;


module.exports = function(userId, number, callback){
	this.find(
		{
			"participants":userId
		},
		{
			messages:{
				$slice:-20
			},
			__v: 0,
			updated:0
		},
		{
			$sort: {updated:1},
			$limit: number
		},
		function(err, convs){
			if(err) return callback(new dbError(err, 500));
			else{
				if(convs) return callback(null, convs);
				else{
					return callback(new dbError(null, 404, null));
				}
			}
		}
	)
};
