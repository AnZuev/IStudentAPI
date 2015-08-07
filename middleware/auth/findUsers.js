var User = require('../../models/User').User;

module.exports = function(req, res, next){
    var keyword = req.query.q;
    keyword = keyword.toString();
    if(typeof keyword != "string") return next(400);
    User.aggregate([{$match:{ $text: { $search: keyword } }},
            {$project:
            //score: { $meta: "textScore" } ,
            {
                score: { $meta: "textScore" },
                student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
            }
            },{$sort:{
                score: { $meta: "textScore" }
            }}
        ])
        .limit(5)
        .exec(function(err, result){
            if(err) return next(500);
            else {
                if(result.length == 0){
                    res.statusCode = 204;
                    res.end();
                }else{
                    res.json(result);
                    res.end();
                }

            }
        })

};