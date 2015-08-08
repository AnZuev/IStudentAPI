var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var badDataError = require('../error').badDataError;
var DbError = require('../error').DbError;



var calendarNew = new Schema({
    type:{
        type:String,
        require:true
    },
    to:{
        type: Schema.Types.ObjectId
    },
    from:{
        type: Schema.Types.ObjectId
    },
    notification:{
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
    var calendarNewItem = new calendarNew({
        type: calendarNewObject.type,
        to:calendarNewObject.to,
        from:calendarNewObject.from,
        notification:{
            title:calendarNewObject.title,
            message: calendarNewObject.message,
            eventId: calendarNewObject.eventId
        }
    });
    calendarNewItem.save(function(err, calendarNewItem){
        if(err) return next(err);
        else return callback(calendarNewItem);
    })
}

calendarNew.statics.getCalendarNewsForUser = function(userId, callback){
    calendarNew.find({to: userId})
        .select({notification:1, to: 0, from: 0, type:1})
        .exec(function(err, calendarNews){
            if(err) {
                return next(err);
            }
           else{
                return callback(calendarNews);
            }
        })
}

calendarNew.statics.removeNew = function(userId, calendarNewId, callback){
    calendarNew.remove({$and:[
        {
            to:userId
        },
        {
            _id: calendarNewId
        }]})
        .exec(function(err, results){
            if(err) return callback(err);
            else{
                console.log(results);
                return callback(null);
            }
    })
}




exports.calendarNew = mongoose.model('calendarNews', calendarNew);



