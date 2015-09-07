var Event = require('../../models/Events').Event;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");
var ns = require('../../socket/notificationService/nsInterface').ns;
var HttpError = require('../../error').HttpError;
var User = require('../../models/User').User;
var async = require('async');



exports.put = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var title = req.body.title;
        var description = req.body.description;
        var invites =  req.body.invites;
        var startTime = req.body.startTime;
        var finishTime = req.body.finishTime;
        var period = req.body.period;
        var type = req.body.type;
        var place = req.body.place;

        if(!Event.validateData(req.body)) return next(400);

        async.waterfall([
            function(callback){
                if(type == 'group') {
                    User.getPeopleByGroupNumber(req.user.personal_information.groupNumber, callback);
                } else if(type== "people" && invites.length > 0 ) {
                    var typeItem = {
                        type: type,
                        invites: invites
                    }
                    return callback(null, typeItem);
                }else{
                    return callback(null, {type: "private", invites: []})
                }
            },
            function(typeItem, callback){
                Event.addEvent(title, startTime, finishTime, period,typeItem.invites,place, description, typeItem.type, req.user._id, function(err, event ){
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
                    calendarAdditionalMethods.createNotificationList(event, function(err, recievers, notification){
                        if(err) {
                            console.error(err + " здесь не может быть ошибки!!!");
                        }
                        else{
                            if(recievers.length > 0) ns.makeListOfRecievers(recievers, notification);
                        }
                    })
                }
            }
            return next();

        })


    }
};


