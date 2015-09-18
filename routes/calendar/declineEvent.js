var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var calendarNews = require('../../models/calendarNews').calendarNews;
var async = require('async');
var mongoose = require('../../libs/mongoose');



exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        async.waterfall([
            function(callback){
                try{
                    eventId = new mongoose.Types.ObjectId(eventId);
                    Event.decline(req.user._id, eventId, callback);
                }catch(e){
                    return callback(new HttpError(400, "Неверный id"));
                }
            },
            function(event, callback){
                calendarNews.removeNewByEvent(eventId, req.user._id, callback)
            }
        ], function(err){
            if(err) {
                console.log("===================== " + err);
                return next(err);
            }
            else {
                res.writeHead(200);
                res.end();
                return next();
            }
        })

    }
};


