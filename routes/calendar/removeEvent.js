var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;


exports.delete = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        Event.removeEvent(eventId, req.user._id, function(err){
            if(err) return next(500);
            else{
                res.send(200);
                res.end();
            }
        })
    }
};


