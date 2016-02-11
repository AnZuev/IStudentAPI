var User = require('../../models/User').User;
var authError = require('../../error').authError;
var universityInterface = require('../../data/index').universityInfoLoader;
var log = require('../../libs/log')(module);


exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var password = req.body.password;
        var studNumber = req.body.studNumber;
        User.signIn(studNumber, password,function(err, user){
            if(err) {
                if(err instanceof authError){
                    return next(401)
                }else{
	                log.error(err);
                    return next(err);
                }
            }else{
                req.session.user = user._id;
                var userToReturn = {
                    name: user.pubInform.name,
                    surname: user.pubInform.surname,
                    photo:user.pubInform.photo,
                    year: user.pubInform.year,
                    faculty: universityInterface.getFacultyName(user.pubInform.university, user.pubInform.faculty),
                    university: universityInterface.getUniversityName(user.pubInform.university),
                    group: user.pubInform.group,
                    id: user._id
                };
                res.json(userToReturn);
                res.end();
                return next();
            }

        });
    }
};