var User = require('../../models/User').User;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;


exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var password = req.body.password;
        var mail = req.body.mail;
        User.signIn(mail, password,function(err, user){
            if(err) {
                if(err instanceof AuthError){
                    return next(new HttpError(403,  err.message))
                }else{
                    return next(err);
                }
            }else{
                req.session.user = user._id;
                var data = {
                    firstName: user.personal_information.first_name,
                    lastName: user.personal_information.last_name,
                    experience: user.about_experience.title,
                    id: user._id
                };
                res.send(data);
                res.end();
                return next();
            }

        });
    }
};