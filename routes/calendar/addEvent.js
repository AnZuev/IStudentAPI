var Event = require('../../models/Events').Event;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");
var ns = require('../../socket/notificationService/nsInterface').ns;
var HttpError = require('../../error').HttpError;


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

        if(type == "people" && invites.length == 0) type = "private";
        if(!Event.validateData(req.body)) return next(400);
        else{
            Event.addEvent(title, startTime, finishTime, period,invites,place, description, type, req.user._id, function(err, event ){
                if(err) {
                    console.error('Произошла ошибка при добавлении события' + err);
                    return next(err);
                }
                else{
                    if(type != "private") {
                        calendarAdditionalMethods.createNotificationList(event, function(err, recievers, notification){
                            if(err) return next();
                            else{
                                if(recievers.length > 0) ns.makeListOfRecievers(recievers, notification);
                            }
                        })
                    }
                    //разослать нотификации юзерам о событие(актуально только если поле  invites не пустое)

                    res.json(event);
                }
            })
        }
    }
};


