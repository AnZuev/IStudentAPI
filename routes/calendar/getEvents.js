var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;


exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var startTime = new Date(req.query.from);
        var finishTime = new Date(req.query.to);


        if(startTime >= finishTime) {
            console.log("СтартТайм больше, чем финишТайм");
            return next(404);
        }
        var full = req.query.full;
        if(full){
            Event.findFromDateToDateFull(req.user._id, startTime, finishTime, function(err, events){
                if(err) return next(err);
                else{
                    if(events.length == 0) {
                        res.sendStatus(404);
                        res.end();
                    }else{
                        res.send(events);
                    }
                }
            })
        }else{
            Event.findFromDateToDateShort(req.user._id, startTime, finishTime, function(err, events){
                if(err) return next(err);
                else{
                    if(events.length == 0) {
                        console.log('nothing found');
                        res.sendStatus(404);
                        res.end();
                    }else{
                        console.log(events);
                        res.send(events);
                        res.end();
                    }

                }
            })
        }
    }
};


