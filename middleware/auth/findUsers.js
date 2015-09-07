var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");
var domain = require('domain');
module.exports = function(req, res, next){
    var keyword = req.query.q.split(' ');
    var length = keyword.length;
    var searchMethod;
    console.log(keyword);
    switch (length){
        case 1:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
                    console.log(users);
                    res.json(users);
                }
            })

            break;
        case 2:
            User.getPeopleByTwoKeys(keyword[0], keyword[1], function(err, users){
                if(err) return next(err);
                else{
                    console.log(users);
                    res.json(users);
                }
            })
            break;
        case 3:
            User.getPeopleByThreeKeys(keyword[0],keyword[1], keyword[2], function(err, users){
                if(err) return next(err);
                else{
                    console.log(users);
                    res.json(users);
                }
            })
            break;
        default:
            User.getPeopleByOneKey(keyword[0], function(err, users){
                if(err) return next(err);
                else{
                    console.log(users);
                    res.json(users);
                }
            })
    }





   /*
    if(1==0) {}
    else{
        var queryDomain = domain.create();
        console.log('Начинаю поиск юзеров');


        queryDomain.run(function(){
            var query = User.aggregate([{$match:{ searchString: { $regex:  }}},
                    {$project:
                        {
                            score: { $meta: "textScore" },
                            student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
                        }
                    },{$sort:{
                        score: { $meta: "textScore" }
                    }}
                ])
                .limit(5);

            var query1 = query.exec();
            query1.then(
                function(result){

                    if(result.length == 0){
                        res.end();

                    }else{
                        res.json(result);
                    }
                    return null;

                })
                .then(null,function(err){
                    if(err) throw err;
                    console.log("rejected");
                    return next();
                });
        });
        queryDomain.on('error', function(err){
            if(err) return next(err);
        })

    }
    */




};