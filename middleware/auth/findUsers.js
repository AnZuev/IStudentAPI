var User = require('../../models/User').User;
var counter = 0;
var mongoose = require("../../libs/mongoose");
var db = mongoose.connection.db;
var domain = require('domain');
module.exports = function(req, res, next){
    var keyword = req.query.q;
    keyword = keyword.toString();
    if(typeof keyword != "string") return next(400);
    else{
        var queryDomain = domain.create();
        console.log('Начинаю поиск юзеров');
        queryDomain.run(function(){
            var query = User.aggregate([{$match:{ $text: { $search: keyword } }},
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

                    /*
                     if(res.headersSent) {
                     console.warn("FindUsers.js: headers already sent");
                     return next();
                     }
                     */
                    if(result.length == 0){
                        //res.statusCode = 204;
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


};