var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var eventId = req.params.eventId;
        Event.getEventById(req.user._id, eventId, function(err, event){
            if(err) return next(err);
            else{
                res.send(JSON.stringify(event));
                return next();
            }
        })

    }
};


