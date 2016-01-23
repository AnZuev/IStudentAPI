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
            User.getPeopleByOneKey(keyword[0], function(err, users){
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
            User.getPeopleByTwoKeys(keyword[0], keyword[1], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();
                }
            });
            break;
        case 3:
            User.getPeopleByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();

                }
            });
            break;
        default:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                    return next();

                }
            })
    }
};


String.prototype.capitilizeFirstLetter = function(){
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}