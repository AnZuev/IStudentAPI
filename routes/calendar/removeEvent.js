var Event = require('../../models/Events').Event;
var calendarNews = require('../../models/calendarNews').calendarNews;

var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;

exports.del = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        Event.removeEvent(eventId, req.user._id, function(err){
            if(err) return next(500);
            else{
                res.sendStatus(200);
                res.end();
                calendarNews.removeAllInvites(eventId, function(err){
                    if(err) {
                        console.error('произошла ошибка при удалении уведомления для календаря с eventId = '+eventId );
                    }

                })
            }
        })
    }
};


