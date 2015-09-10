var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var User = require('../../models/User').User;
var async = require('async');


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        var tasks = [];
        Event.getEventById(req.user._id, eventId, function(err, event){
            if(err) return next(err);
            else{
                for(var i = 0; i < event.participants.accepted.length; i++ ){
                    var userFindFunction = makeGetUsersNameFunction();
                    tasks.push(userFindFunction);
                }

            };


            async.parallel(tasks, function(err, results){
                if(err) throw err;
                else{
                    for(i = 0; i< results.length; i++){
                        event.participants.accepted[i] = {
                            student: results[i],
                            id: event.participants.accepted[i]._id
                        }
                    }
                    res.send(JSON.stringify(event));
                    return next();
                }
            });
        })


    }
};

function makeGetUsersNameFunction(userId){
    return function(callback){
        User.getUserById(userId, function(err, user){
            if(err) throw err;
            return callback(null, user.personal_information.lastName + " " + user.personal_information.firstName);
        })
    }
}


