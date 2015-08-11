var User = require('../../models/User').User;

module.exports = function(req, res, next){
    debugger;
    if(!req.session.user) {
        req.user = res.locals.user = null;
        //next();
    }

    User.find().limit(1).exec(function(err, user){
        if(err) {
            throw err;
            return next(err);
        }
        req.user = res.locals.user = user[0];
        req.session.user = user[0]._id;
        //console.log(req.user + "  " + user[0]);
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