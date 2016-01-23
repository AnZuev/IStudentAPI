var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");

module.exports = function(req, res, next){
    var keyword = req.query.q.split(' ');
    for(var i = 0; i< keyword.length; i++){
       keyword[i] = keyword[i].toLowerCase();
       keyword[i] = keyword[i].capitilizeFirstLetter();
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


