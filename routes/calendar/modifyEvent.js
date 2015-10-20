var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");
var ns = require('../../socket/notificationService/nsInterface').ns;


exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var title = req.body.title;
        var description = req.body.description;
        var invites =  req.body.participants || false;
        var startTime = req.body.startTime || false;
        var finishTime = req.body.finishTime || false;
        var period = req.body.period || false;
        var place = req.body.place || false;
        var eventId = req.params.eventId || false;
        Event.modifyEvent(eventId, title, startTime, finishTime, period,invites,place, description, req.user._id, function(err, event, participants){
            if(err) return next(err);
            else{
                res.send(event);
                calendarAdditionalMethods.modifyCalendarNews(event, participants, function(err, recievers, notifications){
                  if(recievers.length > 0) ns.makeListOfRecievers(recievers, notification);
                  console.log(arguments);
               });
            }
         })

    }else{
        next(403);
    }
};


