var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");
require('../../libs/additionalFunctions/extensionsForBasicTypes');


var universityData = require('../../data/index').universityInfoLoader;


module.exports = function(req, res, next){
    var keyword = req.query.q.split(' ');
    for(var i = 0; i< keyword.length; i++){
       keyword[i] = keyword[i].toLowerCase();
       keyword[i] = keyword[i].capitilizeFirstLetter();
    }
    switch (keyword.length){
        case 1:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) {
                    return next(err);
                }
                else{var res = [];
	                users.forEach(function(element){
		                res.push(universityData.makeContact(element));
	                });
                    res.json(res);
                    return next();
                }
            });
            break;
        case 2:
            User.getPeopleByTwoKeys(keyword[0], keyword[1], function(err, users){
                if(err) return next(err);
                else{
	                users.forEach(function(element){
		                res.push(universityData.makeContact(element));
	                });
	                res.json(res);
                    return next();
                }
            });
            break;
        case 3:
            User.getPeopleByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){
                if(err) return next(err);
                else{
	                users.forEach(function(element){
		                res.push(universityData.makeContact(element));
	                });
	                res.json(res);
                    return next();

                }
            });
            break;
        default:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
	                users.forEach(function(element){
		                res.push(universityData.makeContact(element));
	                });
	                res.json(res);
                    return next();

                }
            })
    }
};


