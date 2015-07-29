var User = require('../../models/User').User;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;

exports.post = function(req, res, next){

    var first_name = req.body.firstName;
    var last_name = req.body.lastName;
    var password = req.body.password;
    var studNumber = req.body.studNumber;
    var year = req.body.year;
    var faculty = req.body.faculty;
    var groupNumber = req.body.groupNumber;

    User.signUp(first_name, last_name, groupNumber, faculty, year, studNumber, password, function(err, user){
      if(err){
          if(err instanceof AuthError){
              return next(new HttpError(400,  err.message))
          }else{
              return next(err);
          }
      }else{
          req.session.user = user._id;
          var data = {
              firstName: user.personal_information.firstName,
              lastName: user.personal_information.lastName,
              groupNumber: user.personal_information.groupNumber,
              faculty: user.personal_information.faculty,
              year: user.personal_information.year,
              photoUrl: user.personal_information.photoUrl,
              id: user._id
          };
          res.send(data);
          res.end();
          return next();
      }

    });
};


