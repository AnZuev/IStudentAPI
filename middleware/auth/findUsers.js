var User = require('../../models/User').User;
var mongoose = require("../../libs/mongoose");
var domain = require('domain');
module.exports = function(req, res, next){
    var keyword = req.query.q.split(' ');
    var length = keyword.length;
    var name, surname, groupNumber=0, i;
    var searchMethod;
    console.log(keyword);
    switch (length){
        case 1:

            if(/[0-9]/.test(keyword[0])){
                searchMethod = "getPeopleByGroup";
                groupNumber = parseInt(keyword[0]);
            }
            else {
                name = keyword[0];
                searchMethod = "getPeopleByName";

            }

            console.log(searchMethod);

            break;
        case 2:
            for(i = 0; i< 2; i++){
                if(/[0-9]/.test(keyword[i])){
                    groupNumber = parseInt(keyword[i]);
                }else{
                    if(!name) name = keyword[i];
                    else surname = keyword[i];
                }
            }
            if(groupNumber) searchMethod = "getPeopleByGroupAndName";
            else searchMethod = "getPeopleByNameAndSurname";
            console.log(searchMethod);

            break;
        case 3:
            for(i = 0; i< 3; i++){
                if(/[0-9]/.test(keyword[i])){
                    groupNumber = parseInt(keyword[i]);
                }else{
                    if(!name) name = keyword[i];
                    else surname = keyword[i];
                }

                if(groupNumber) searchMethod = 'getPeopleByNameAndSurnameAndGroup';
                else searchMethod = "getPeopleByNameAndSurname";
                console.log(searchMethod);

                break;
            }
    }


    switch (searchMethod){
        case "getPeopleByGroup":
            User.getPeopleByGroupNumber(groupNumber, function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                }
            })

            break;
        case "getPeopleByName":
            User.getPeopleByName(name, function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                }
            })

            break;
        case "getPeopleByGroupAndName":
            User.getPeopleByNameAndGroup(name, groupNumber, function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                }
            })

            break;
        case "getPeopleByNameAndSurnameAndGroup":
            User.getPeopleByNameAndSurnameAndGroup(name, surname, groupNumber, function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                }
            })
            break;
        case "getPeopleByNameAndSurname":
            User.getPeopleByNameAndSurname(name, surname, function(err, users){
                if(err) return next(err);
                else{
                    res.json(users);
                }
            });
            break;

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