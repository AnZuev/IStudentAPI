var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var calendarNews = require('../../models/calendarNews').calendarNews;
var async = require('async');
var mongoose = require('../../libs/mongoose');
var ns = require('../../socket/notificationService/nsInterface').ns;
var calendarAdditionalMethods = require("../../libs/additionalFunctions/calendar");




exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        async.waterfall([
            function(callback){
                try{
                    eventId = new mongoose.Types.ObjectId(eventId);
                    Event.accept(req.user._id, eventId, callback);
                }catch(e){
                    console.error(e);
                    return callback(new HttpError(400, "Неверный id"));
                }
            },
            function(event, callback){
                calendarNews.removeNewByEvent(eventId, req.user._id, function(err){
                    if(err) return callback(err);
                    else{
                        res.writeHead(200);
                        res.end();
                        event = event[0];
                        calendarAdditionalMethods.sendNotificationForAcceptDecline(req.user._id, event, "acceptEvent", function(err){
                            if(err) {
                                console.error(err + " здесь не может быть ошибки!!!");
                                return next();
                            }
                        });
                        return next();
                    }
                })
            }

        ], function(err){
            if(err) {
                return next(err);
            }
        })
    }
};


