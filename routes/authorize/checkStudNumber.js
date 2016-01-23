var User = require('../../models/User').User;
var console = require('../../libs/log')(module);


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var studNumber = req.param('studNumber');
        User.findOne({"auth.studNumber": studNumber}, function(err, user){
            if(err) return next(err);
            if(user) res.send(false);
            else{
                res.send(true);
            }
        });
    }
};