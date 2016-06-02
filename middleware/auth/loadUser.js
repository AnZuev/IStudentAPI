var User = require('../../models/User/index').User;


module.exports = function(req, res, next){
    if(!req.session.user) {
        req.user = res.locals.user = null;
        next();
    }else{
        User.findById(req.session.user, function(err, user){
            if(err) {
                next(new require('../../error').dbError(err, null, null));
            }else{
	            if(user){
		            req.user = res.locals.user = user.pubInform;
		            req.settings = user.settings;
	            }else{
		            req.session.user = null;
	            }
            }
	        next();
        })
    }
};