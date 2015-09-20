var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");


exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var title = req.body.title;
        var description = req.body.description;
        var invites =  req.body.invites;
        var startTime = req.body.startTime;
        var finishTime = req.body.finishTime;
        var period = req.body.period;
        var place = req.body.place;
        var eventId = req.params.eventId;
        console.log(req.body);
        Event.modifyEvent(eventId, title, startTime, finishTime, period,invites,place, description, req.user._id, function(err, event, participants){
            if(err) return next(err);
            else{
               var usersForNotify = calendarAdditionalMethods.modifyCalendarNews(event, participants);
                    //разослать нотификации юзерам о событие(актуально только если поле  invites не пустое)
               res.sendStatus(200);
               res.send(event);
                }
         })

    }else{
        next(403);
    }
};


