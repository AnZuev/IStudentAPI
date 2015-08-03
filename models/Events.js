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
        type: Date.now,
        require:true
    },
    creator:{
        type: Schema.Types.ObjectId,
        require:true
    }

});



Event.statics.addEvent = function(title, startTime, finishTime, period, invites, place, description, type, creator, callback){
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
        if(err) return callback(new DbError("Ошибка при создания события с данными: /n" + event + ". Ошибка " + err ));
        else return callback(null, event);
    });

}

Event.statics.modifyEvent = function(id, title, startTime, finishTime, period, invites, place, type, creator, callback){
    var Event = this;
    async.waterfall([
            function(callback){
                Event.findById(id, callback)
            },
            function(event, callback){
                if(!event){
                    return callback(new DbError("Событие не найдено: " + id));
                }else{
                    var modifiedEvent = new Event({
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
                        type: type,
                        creator: creator
                    });
                    event.save(function(err){
                        if(err) return callback(new DbError("Ошибка при обновления события с  id " + id + " и данными: /n" + event + "./n Ошибка " + err ));
                        else return callback(null, modifiedEvent);
                    });
                }

            }
    ], callback);


};

Event.statics.removeEvent = function(id, callback){
    Event.findByIdAndRemove(id, function(err, result){
        if(err) return callback(new DbError("Ошибка при удаления события с id = " + id + ". Ошибка " + err ));
        else return callback(null, result);
    });

};

Event.statics.findFromDateToDate = function(userId,start, finish, callback){
    var result = Event.find({creator: userId}).or({"participants.accepted": userId}).where('time.start').gte(start).lte(finish).exec(callback);
    console.log(result);
}

Event.statics.accept = function(userId, eventid, callback){
    var Event = this;
    async.waterfall([
        function(callback){
            Event.findById({eventId: eventid, "participants.invites": userId}, callback);
        },
        function(event, callback){
            if(!event) return callback(new badDataError("Не могу найти событие с юзером в приглашениях. User = " + userId + ", EventId = " + eventid));
            else{
                Event.update({id: userId}, {$pull :{ "participants.invites": userId}, $push:{"participants.accepted": userId}}, function(err){
                    if(err) return callback(new DbError("Произошла ошибка при изменении данных поля participants.invites и participants.accepted . UserId = " + userId + " , eventId = " + eventid ));
                    else return callback(null)
                });
            }

        }
    ], callback)

}

Event.statics.decline = function(userId, eventid, callback){
    var Event = this;
    async.waterfall([
        function(callback){
            Event.findById({eventId: eventid, "participants.invites": userId}, callback);
        },
        function(event, callback){
            if(!event) return callback(new badDataError("Не могу найти событие с юзером в приглашениях. User = " + userId + ", EventId = " + eventid));
            else{
                Event.update({id: userId}, {$pull :{ "participants.invites": userId}, $push:{"participants.declined": userId}}, function(err){
                    if(err) return callback(new DbError("Произошла ошибка при изменении данных поля participants.invites и participants.declined . UserId = " + userId + " , eventId = " + eventid ));
                    else return callback(null)
                });
            }

        }
    ], callback);
};

Event.statics.checkUserInEvent = function(userId, EventId, callback){

}


exports.Event = mongoose.model('Event', Event);



