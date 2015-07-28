var User = require('../../models/User').User;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;

exports.post = function(req, res, next){
    var first_name = req.body.firstName;
    var last_name = req.body.lastName;
    var password = req.body.password;
    var mail = req.body.mail;
    User.signUp(first_name, last_name, password, mail, function(err, user){
      if(err){
          if(err instanceof AuthError){
              return next(new HttpError(400,  err.message))
          }else{
              return next(err);
          }
      }
        req.session.user = user._id;
        var data = {
            firstName: user.personal_information.first_name,
            lastName: user.personal_information.last_name,
            experience: user.about_experience.title
        };
        res.send(data);
        res.end();
        return next();
    });
};


