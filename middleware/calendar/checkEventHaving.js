var Event= require('../../models/Events').Event;
var httpError = require('../../error').HttpError;

module.exports = function(req, res, next){


    Event.find({creator: req.session.user, _id: req.params.eventId}, function(err, event){ // вспомнить как получить id из запроса
        if(err) {

            next(err);
        }
        else{
            if(event){
                req.event = event;
                return next();
            }else{
                return next(new httpError(403, "У вас недостаточно прав для изменения/удаления событи"))
            }

        }

    })
};