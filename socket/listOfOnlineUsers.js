var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var onlineUser = new Schema({
    userId: {
        require: true,
        type: Schema.Types.ObjectId,
        unique: true
    },
    socketId:{
        require: true,
        type:String
    }
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
}

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

exports.onlineUsers = mongoose.model('onlineUser', onlineUser);
