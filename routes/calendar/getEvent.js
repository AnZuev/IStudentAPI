var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var User = require('../../models/User').User;
var async = require('async');


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        Event.getEventById(req.user._id, eventId, function(err, event){
            if(err) return next(err);
            else{
               var arrayOfTasks = [];
                console.log(event.participants.accepted);
                for(var i = 0; i< event.participants.accepted.length; i++){
                    var newTask = function(callback){
                        User.getUserById(event.participants.accepted[i], function(err, user){
                            if(err) throw err;
                            console.log("Вывод из поиска юзера по id " + arguments);
                            return callback(null, user.personal_information.lastName + " " + user.personal_information.firstName);
                        })

                    };
                    arrayOfTasks.push(newTask);
                };

                async.parallel(arrayOfTasks, function(err, results){
                    console.log(arguments);
                    if(err) throw err;
                    else{
                        for(i = 0; i< results.length; i++){

                            event.participants.accepted[i] = {
                                name: results[i],
                                id: event.participants.accepted[i]._id
                            }
                        }
                        console.log(event);
                        res.send(JSON.stringify(event));
                        return next();
                    }

                });

            }
        })

    }
};




