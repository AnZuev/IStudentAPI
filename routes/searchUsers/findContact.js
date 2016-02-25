var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");

module.exports = function(req, res, next){
    var keywords = req.query.q.split(' ');
	var keyword = [];

	for(var i = 0; i< keywords.length; i++){
		keyword[i] = '^' + keywords[i].toLowerCase();
		keyword[i] = new RegExp(keyword[i], 'ig');
	}

    switch (keyword.length){
        case 1:
            User.getContactsByOneKey(keyword[0], function(err, users){
                if(err) {
                    return next(err);
                }
                else{
                    res.json(users);
                    return next();
                }
            });
            break;
        case 2:
            User.getContactsByTwoKeys(keyword[0], keyword[1], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();
                }
            });
            break;
        case 3:
            User.getContactsByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();

                }
            });
            break;
        default:
            User.getContactsByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();

                }
            })
    }
};


