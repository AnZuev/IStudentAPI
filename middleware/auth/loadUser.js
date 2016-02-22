var User = require('../../models/User').User;


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
	            }else{
		            req.session.user = null;
	            }
            }
	        next();
        })
    }
};