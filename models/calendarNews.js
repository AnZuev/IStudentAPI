var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var badDataError = require('../error').badDataError;
var DbError = require('../error').DbError;



var calendarNew = new Schema({

    to:{
        type: Schema.Types.ObjectId
    },
    from:{
        type: Schema.Types.ObjectId
    },
    notification:{
        type:{
        type:String,
        require:true
        },
        title:{
            type: String,
            require:true
        },
        message:{
            type: String,
            require:true
        },
        eventId:{
            type: Schema.Types.ObjectId
        }
    },
    created:{
        type: Date,
        require:true,
        default:Date.now
    }

});

calendarNew.statics.addNew = function(calendarNewObject, callback){
    var calendarNew = this;
    var calendarNewItem = new calendarNew({
        to:calendarNewObject.to,
        from:calendarNewObject.from,
        notification:{
            type: calendarNewObject.notification.type,
            title:calendarNewObject.notification.title,
            message: calendarNewObject.notification.message,
            eventId: calendarNewObject.notification.eventId
        }
    });
    calendarNewItem.save(function(err, calendarNewItem){
        if(err) return callback(err);
        else return callback(null,calendarNewItem);
    })
}

calendarNew.statics.getCalendarNewsForUser = function(userId, callback){
    this.find({to: userId})
        .select({"notification.title":1, "notification.message":1, "notification.type":1, "notification.eventId":1})
        .exec(function(err, calendarNews){
            if(err) {
                return callback(err);
            }
           else{
                return callback(null,calendarNews);
            }
        })
}

calendarNew.statics.removeNew = function(userId, calendarNewId, callback){
    this.remove({$and:[
        {
            to:userId
        },
        {
            _id: calendarNewId
        }]})
        .exec(function(err){
            if(err) return callback(err);
            else{
                callback(null);
            }
    })
}

calendarNew.statics.removeAllInvites = function(eventId, callback){
    this.remove({"notification.eventId": eventId, "notification.type":"invite"})
        .exec(function(err){
            if(err) return callback(err);
            else{
                callback(null);
            }
        })
}

exports.calendarNews = mongoose.model('calendarNews', calendarNew);



