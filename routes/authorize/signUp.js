var User = require('../../models/User').User;
var httpError = require('../../error').HttpError;
var authError = require('../../error').authError;
var universityInterface = require('../../data/index').universityInfoLoader;
var dataJson = require('../../data/university.json');

exports.post = function(req, res, next){

	try{
		var name = req.body.firstName.capitilizeFirstLetter();
		var surname = req.body.lastName.capitilizeFirstLetter();
		var password = req.body.password;
		var studNumber = req.body.studNumber;
		var year = req.body.year;
		var faculty = req.body.faculty;
		var group = req.body.group;
		var university = req.body.university;
	}catch(e){
		next(400);
	}

    if(dataJson[university] && dataJson[university].faculty[faculty]){
        User.signUp(name, surname, group, faculty, university, year, studNumber, password, function(err, user){
            if(err){
                if(err instanceof authError){
                    return next(new httpError(400,  err.message))
                }else{
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
    else{
        next(400)
    }


};


String.prototype.capitilizeFirstLetter = function(){
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

