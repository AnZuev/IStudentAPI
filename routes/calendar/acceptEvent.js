var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var calendarNews = require('../../models/calendarNews').calendarNews;
var async = require('async');


exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        async.waterfall([
            function(callback){
                Event.accept(req.user._id, eventId, callback);
            },
            function(event, callback){
                calendarNews.removeNewByEvent(eventId, req.user._id, callback)
            }
        ], function(err){
            if(err) {
                throw err;
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


