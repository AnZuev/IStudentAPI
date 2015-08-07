var Event = require('../../models/Events').Event;
var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;


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
        if(!Event.validateData(req.body)) return next(400);
        else{
            Event.addEvent(title, startTime, finishTime, period,invites,place, description, type, req.user._id, function(err, event ){
                if(err) return next(err);
                else{
                    //разослать нотификации юзерам о событие(актуально только если поле  invites не пустое)

                    res.sendStatus(200);
                    res.json(event);
                    res.end();
                }
            })
        }
    }
};


