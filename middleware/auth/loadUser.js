var User = require('../../models/User').User;

module.exports = function(req, res, next){
    if(!req.session.user) {
        req.user = res.locals.user = null;
        next();
    }
    User.find().limit(1).exec(function(err, user){
        if(err) {
            next(err);
        }
        req.user = res.locals.user = user;
        req.session.user = user._id;
        return next();

    })
    /*
    User.findById(req.session.user, function(err, user){
        if(err) {
            next(err);
        }
        req.user = res.locals.user = user;
        return next();
    })
    */
};