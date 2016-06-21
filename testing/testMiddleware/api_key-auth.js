var User = require(appRoot + '/models/User').User;
module.exports = function(req, res, next){
	var api_key = req.query.api_key || "";
	if(api_key.length == 0) return next();
	switch (api_key){
		case "activated":
			User.find(
				{
					"activation.activated": true
				},
				function(err, res){
					if(res.length > 0){
						req.session.user = res[0]._id;
					}
					return next();
				}
			);
			break;
		case "no-activated":
			User.find(
				{
					"activation.activated": false
				},
				function(err, res){
					if(res.length > 0){
						req.session.user = res[0]._id;
					}
					return next();
				}
			);
			break;
	}

};