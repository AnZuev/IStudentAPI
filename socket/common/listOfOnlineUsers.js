var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');


var onlineUser = new Schema({
    userId: {
        require: true,
        type: Schema.Types.ObjectId,
        unique: true
    },
    socketId:{
        require: true,
        type:String
    },
    markers:[String]
});

onlineUser.statics.addToList = function(userId, socketId, callback){
    var newOnlineUser = new this({
        userId: userId,
        socketId: socketId
    });
    newOnlineUser.save(function(err, newOnlineUser){
        if(err) return callback(err);
        else{
            callback(null, newOnlineUser);
        }
    })
};

onlineUser.statics.removeFromList = function(userId, callback){
   this.remove({userId: userId}, function(err){
       if(err) return callback(err);
       else{
           return callback(null);
       }
   })
}

onlineUser.statics.checkIfUserOnline = function(userId, callback){
    this.findOne({userId: userId}, function(err, user){
        if(err) return callback(err);
        else{
            if(user){
                return callback(null, user.socketId);
            }else{
                return callback(null, null);
            }
        }
    })
}

onlineUser.statics.addMarker = function(userId, marker, callback){
    var onlineUser = this;
    async.waterfall([
        function(callback){
            onlineUser.find({userId:userId}, callback)
        },
        function(userItem, callback){
            if(err) return callback(err);
            if(!userItem) return callback(new Error('Не могу найти юзера для добавления ему маркера ' + userId));
            else{
                if(userItem.markers.indexOf(marker) < 0) userItem.markers.push(marker);
                else{
                    console.info('Напрасно добавлял маркер' + marker + " юзеру " + userId);
                }
                return callback(null)
            }
        }
    ], function(err){
        if(err) {
            console.error("Произошла ошибка при добавлении маркера" + marker + " юзеру " +userId + err);
            return callback(err)
        }
        else{
            return callback(null);
        }
    })
}

exports.onlineUsers = mongoose.model('onlineUser', onlineUser);
