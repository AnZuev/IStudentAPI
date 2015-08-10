var Event = require('../../models/Events').Event;
var calendarNews = require('../../models/calendarNews').calendarNews;
var User = require('../../models/User').User;


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
                        User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
                            if(err) return next(err);
                            else{
                                var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
                                for(var i = 0; i < event.participants.invites.length; i++){
                                    var calendarNewItem = {
                                        to: event.participants.invites[i],
                                        from: event.creator,
                                        notification:{
                                            type:  "invite",
                                            title: title,
                                            message: event.description,
                                            eventId: event._id
                                        }
                                    }
                                    calendarNews.addNew(calendarNewItem, function(err, calendarNewItem){
                                        if(!err){
                                            //разослать нотификации юзерам, которые онлайн
                                        }

                                    })
                                }
                            }
                        })


                    //разослать нотификации юзерам о событие(актуально только если поле  invites не пустое)

                    res.sendStatus(200);
                    res.json(event);
                    res.end();
                }
            })
        }
    }
};


