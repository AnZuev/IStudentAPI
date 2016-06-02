var Event = require('../../models/Events').Event;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");
var ns = require('../../socket/notificationService/nsInterface').ns;
var HttpError = require('../../error').HttpError;
var User = require('../../models/User/index').User;
var async = require('async');



exports.put = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var title = req.body.title;
        var description = req.body.description;
        var invites;
        try{invites = unique(req.body.invites)}catch(e){  invites = []}
        var startTime = req.body.startTime;
        var finishTime = req.body.finishTime;
        var period = req.body.period;
        var type = req.body.type;
        var place = req.body.place;


        if(!Event.validateData(req.body)) return next(400);

        async.waterfall([
            function(callback){
                if(type == 'group') {
                    User.getPeopleByGroupNumber(req.user.personal_information.groupNumber, function(err, users){
                        if(err) return callback(err);
                        users = users.splice(users.indexof(req.user._id)-1,1);
                        var typeItem = {
                            type: "group",
                            invites: users
                        };
                        return callback(null, typeItem);
                    });
                } else if(type == 'private'){
                    return callback(null, {type: "private", invites: []})

                } else if(type== "people" && invites.length > 0 ) {
                    var typeItem = {
                        type: type,
                        invites: invites
                    };
                    return callback(null, typeItem);
                } else{
                    return callback(null, {type: "private", invites: []})
                }
            },
            function(typeItem, callback){
                Event.addEvent(title, startTime, finishTime, period, typeItem.invites, place, description, typeItem.type, req.user._id, function(err, event ){
                    if(err) {
                        console.error('Произошла ошибка при добавлении события' + err);
                        return callback(err);
                    }
                    else{
                        return callback(null, event);
                    }
                })

            }
        ],function(err, event){
            if(err) return next(err);
            else{
                res.json(event);
                if(type != "private") {
                    calendarAdditionalMethods.createCalendarNewsAndNotifications(event, function(err, recievers, notification){
                        if(err) {
                            console.error(err + " здесь не может быть ошибки!!!");
                        }
                        else{
                            console.log(arguments);
                        }
                    })
                }
            }
            return next();

        })


    }
};

function unique(array){
    var obj = {};

    for (var i = 0; i < array.length; i++) {
        var str = array[i];
        obj[str] = true;
    };

    return Object.keys(obj);
}
