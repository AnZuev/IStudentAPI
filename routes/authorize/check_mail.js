var User = require('../../models/User').User;


exports.get = function(req, res, next){
	var mail = req.param('mail');
	User.findOne({"personal_information.mail": mail}, function(err, user){
		if(err) return next(err);
		if(user) res.send(true);
		else{
			res.send(false);
		}
	});
};