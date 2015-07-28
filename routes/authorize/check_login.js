var User = require('../../models/User').User;


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var login = req.param('login');
        console.log(login);
        User.findOne({"auth.login": login}, function(err, user){
            if(err) return next(err);
            if(user) res.send(false);
            else{
                res.send(true);
            }
        });
    }
};