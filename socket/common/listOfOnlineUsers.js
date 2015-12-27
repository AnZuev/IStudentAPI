var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var User = require('../../models/User').User;
var DbError = require('../../error').DbError;


var onlineUser = new Schema({
    userId: {
        require: true,
        type: Schema.Types.ObjectId,
        unique: true
    },
    sockets:[{
        type:{
            require: true,
            type:String
        },
        sockets: [{
            require: true,
            type:String
        }]
    }]
});

onlineUser.statics.getSocketsByUserIdAndType = function(userId, socketsType, callback){
    this.findOne({userId:userId, "sockets.type": socketsType}, {"sockets.$": 1}, function(err, onlineUserItem){
        if(err) return callback(err);
        else{
            if(!onlineUserItem) return callback(true);
            return callback(null, onlineUserItem);
        }
    })
};

onlineUser.statics.addToList = function(userId, socketItem, callback){
    var onlineUserSchema = this;
   async.waterfall([
       function(callback){
           onlineUserSchema.getSocketsByUserIdAndType(userId, socketItem.type, callback);
       },
       function(onlineUser, callback){

           if(onlineUser.sockets.indexOf(socketItem.socketId)< 0){
               onlineUserSchema.findOne({
                   userId: userId, "sockets.type": socketItem.type
               }, function(err, item){

                   console.log("userId: " + userId + " sockets "  + item.sockets[0].sockets);
               });
               onlineUserSchema.findOneAndUpdate(
                   {
                       userId:userId, "sockets.type": socketItem.type
                   },
                   {
                       $push:{
                            "sockets.$.sockets":socketItem.sockets
                        }
                   },
                   callback
               )
           }else{
               return callback(false);
           }
       }
   ], function(err, onlineUser){
       if(err) return callback(err);
       else{
           return callback(null);
       }
   })

};

onlineUser.statics.addNewUser = function(userId, socketItem, callback){
    var newOnlineUser = new this({
        userId: userId,
        sockets: [socketItem]
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
};

onlineUser.statics.removeSocket = function(userId, socketItem, callback){
    onlineUser.findOneAndUpdate(
        {
            userId:userId,
            "sockets.type":socketItem.type
        },
        {
            $pullAll:{
                "sockets.sockets": socketItem.socketId
            }
        },
        function(err){
            if(err) return callback(false);
            else{
                return callback(null);
            }
        }
    )
};

onlineUser.statics.checkIfUserOnline = function(userId, callback){
    this.findOne({userId: userId}, function(err, user){
        if(err) return callback(err);
        else{
            if(user){
                return callback(null, user.sockets);
            }else{
                return callback(null, null);
            }
        }
    })
};



exports.onlineUsers = mongoose.model('onlineUser', onlineUser);
