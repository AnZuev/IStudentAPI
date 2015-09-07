var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var badDataError = require('../error').badDataError;
var DbError = require('../error').DbError;



var Event = new Schema({
    title:{
        type: String,
        require: true
    },
    time:{
        start:{
            type: Date,
            require: true
        },
        finish:{
            type: Date,
            require: true
        }
    },
    period:{
        type: String,
        require: false
    },
    participants:{
        accepted: [Schema.Types.ObjectId],
        declined:[Schema.Types.ObjectId],
        invites:[Schema.Types.ObjectId]
    },
    place:{
        type: String,
        require: false
    },
    description:{
        type: String,
        require: false
    },
    type:{
        type: String,
        require: true
    },
    created:{
        type: Date,
        require:true,
        default:Date.now
    },
    creator:{
        type: Schema.Types.ObjectId,
        require:true
    }

});



Event.statics.addEvent = function(title, startTime, finishTime, period, invites, place, description, type, creator, callback){
    console.log(arguments);
    var Event = this;
    var event = new Event({
        title: title,
        time: {
            start: startTime,
            finish: finishTime
        },
        period: period,
        participants:{
            invites: invites
        },
        place: place,
        description: description,
        type: type,
        creator: creator
    });
    event.save(function(err){
        if(err) return callback(new DbError(500,"Ошибка при создания события с данными: /n" + event + ". Ошибка " + err ));
        else return callback(null, event);
    });

}

Event.statics.modifyEvent = function(eventId, title, startTime, finishTime, period, invites, place, descriotion, userId, callback){
    var Event = this;
    async.waterfall([
            function(callback){
                Event.find({_id:eventId},{creator: userId}, callback);
            },
            function(event, callback){
                if(event.length == 0){
                    return callback(new DbError(403, "Событие не найдено: " + eventId));
                }else{
                    var participants = event.participants.invites.concat(event.participants.accepted).sort();
                    event = event[0];
                    event.title = title;
                    event.time.start = startTime;
                    event.time.finish = finishTime;
                    event.period = period;
                    event.participants.invites = invites;
                    event.place = place;
                    event.type = type;
                    event.save(function(err, modifiedEvent){
                        if(err) return callback(new DbError("Ошибка при обновления события с  id " + eventId + " и данными: /n" + event + "./n Ошибка " + err ));
                        else return callback(null, modifiedEvent, participants);
                    });


                }

            }
    ], callback);


};

Event.statics.removeEvent = function(eventId, userId, callback){
    var Event = this;
    var flag = false;
    async.waterfall([
        function(callback){
            Event.find({$and:[{_id:eventId},{creator: userId}]}, callback);
        },
        function(event, callback){
            console.log(event);
            if(event.length == 0){
                Event.find({_id:eventId}, {"participants:accepted": userId}, callback);
            }else{
                flag = true;
                event = event[0];
                console.log("Удаляю событие, creator");
                event.remove(function(err){
                    if(err) return callback(new DbError("Ошибка при удалении события с  id " + eventId + " и данными: /n" + event + "./n Ошибка " + err ));
                    else return callback(null, event);
                });
            }
        },
        function(event, callback){
            if(flag) return callback(null);
            if(event.length == 0){
                return callback(new DbError(403, "Событие не найдено: " + eventId));
            }else{
                console.log("Удаляю событие. Participants.accepted")
                Event.update({_id: eventId}, {$pull :{ "participants.accepted": userId}}, function(err, events){
                    if(err) return callback(new DbError("Произошла ошибка при изменении данных поля participants.accepted. UserId = " + userId + " , eventId = " + eventid ));
                    else return callback(null, events)
                });
            }

        }
    ], callback);

};

Event.statics.findFromDateToDateFull = function(userId, start, finish, callback){
    var Event = this;
    start = new Date(start);
    finish = new Date(finish);
    Event.find({$and:[{
        $or:[
            {creator: userId},
            {"participants.accepted" : userId}
        ]
    }, {"time.start": {$gte: start, $lte: finish}}
    ]}).sort('time.start').select({title:1, description:1, place: 1, "time.start":1, "time.finish":1, period:1, type:1, "participants.accepted":1, _id: 1 })
        .exec(function(err, events){
            if(err) return callback(err);
            else{
                return callback(null, events);
            }
        });


}

Event.statics.findFromDateToDateShort = function(userId, start, finish, callback){
    var Event = this;
    start = new Date(start);
    finish = new Date(finish);
    Event.find({$and:[{
        $or:[
            {creator: userId},
            {"participants.accepted" : userId}
        ]
    }, {"time.start": {$gte: start, $lte: finish}}
    ]}).sort('time.start').select({title:1, _id: 1, "time.start":1, "time.finish":1})
        .exec(function(err, events){
            if(err) return callback(err);
            else{
                return callback(null, events);
            }
        });


}

Event.statics.accept = function(userId, eventid, callback){
    var Event = this;
    async.waterfall([
        function(callback){
            Event.find({$and:[{_id: eventid}, {"participants.invites": userId}]}, callback);
        },
        function(event, callback){
            if(event.length == 0) return callback(new badDataError(403,"Не могу найти событие с юзером в приглашениях. User = " + userId + ", EventId = " + eventid));
            else{
                console.log('Событие нашел, делаю изменения');
                Event.update({_id: eventid}, {$pull :{ "participants.invites": userId}, $push:{"participants.accepted": userId}}, function(err, events, affected){
                    if(err) return callback(new DbError(500, "Произошла ошибка при изменении данных поля participants.invites и participants.accepted . UserId = " + userId + " , eventId = " + eventid ));
                    else return callback(null, events);
                });

            }

        }
    ], callback)

}

Event.statics.decline = function(userId, eventId, callback){
    var Event = this;
    userId = new mongoose.Types.ObjectId(userId);
    eventId = new mongoose.Types.ObjectId(eventId);
    async.waterfall([
        function(callback){
            Event.find({_id: eventId}, {"participants.invites": userId}, callback);
        },
        function(event, callback){
            console.log(typeof userId);
            if(event.length == 0) return callback(new badDataError(400,"Не могу найти событие с юзером в приглашениях. User = " + userId + ", EventId = " + eventId));
            else{
                Event.update({_id: eventId}, {$pull :{ "participants.invites": userId}, $push:{"participants.declined": userId}}, function(err, events){
                    if(err) return callback(new DbError("Произошла ошибка при изменении данных поля participants.invites и participants.declined . UserId = " + userId + " , eventId = " + eventid ));
                    else return callback(null, events)
                });
            }
        }
    ], callback);
};

Event.statics.validateData = function(event){
    if(event.title.length < 5 || event.startTime > event.finishTime ){
        return false;
    }
    return true;
}

Event.statics.getEventById = function(userId, eventId, callback){
    var Events = this;
    async.waterfall([
        function(callback){
            Events.findById(eventId, callback)
        },
        function(event, callback){
            if(!event) return callback(new DbError(404, 'Ничего не найдено'));
            if(event.participants.accepted.indexOf(userId) > 0 || event.creator  == userId){
                return callback(null, event);
            }else{
                console.log(event.creator + " " + userId);
                console.log(event.participants.accepted.indexOf(userId) > 0 )
                return callback(new DbError(403, 'Запрещено'));
            }
        }
    ], callback);

}



exports.Event = mongoose.model('Event', Event);



