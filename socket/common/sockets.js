/*
 * Определяем модель onlineUser для работы с пользователями, которые подключены по протоколу
 * ws к нам. Нужно в первую очередь для отправки нотификаций и сообщений в диалоге.
 * userId - идентификатор пользователя в коллекции users
 * sockets - массив объектов типа сокет, у него есть
 *          id - уникальный идентификатор соединения,
 *          cType(array) - типы данных, которые можно гонять по данному соединению. Сейчас это ns или im для нотификаций и диалогов соответственно
 */

var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var User = require('../../models/User').User;
var dbError = require('../../error').dbError;
var log = require('../../libs/log')(module);



var sockets = new Schema({
    userId: {
        require: true,
        type: Schema.Types.ObjectId,
        unique: true
    },
    sockets:[
        {
            cType:[String],
            id: {
                require: true,
                type:String,
                unique: true
            },
            _id:false

        }
    ]

});


/*
* Получает идентификаторы подключений типа socketType для пользователя c userId
* на вход получает userId и socketType
* В случаем успешного выполнения возвращает массив идентификаторов
* В случаем ошибки передает в callback ошибку (true)
 */
sockets.statics.getSocketsByUserIdAndType = function(userId, socketsType, callback){
    this.findOne(
        {
            userId:userId,
            $and:[
                {
                    "sockets.cType":socketsType
                },
                {
                    "sockets.cType":{ $size: 1 }
                }
            ]
        },
        {
            "sockets.$.id": 1,
            _id:0
        },

        function(err, userItem){
        if(err) return callback(new dbError(err));
        else{
            if(!userItem) return callback(null, null);
            return callback(null, userItem.sockets);
        }
    })
};


/*
 * Получает идентификатор подключения пользовазеля по id
 *  на вход получает userId и socketType(ns или im)
 *  В случае успешного выполнения возвращает объект сокета {id:schema.types.objectId, cType:[string]}
 *  В случае ошибки кидает ошибку
 *
 */
sockets.statics.getSocketByUserIdAndId = function(userId, socketId, callback){
    this.findOne({userId:userId, "sockets.id":socketId}, {"sockets.$": 1, _id:0}, function(err, userItem){
        if(err) throw err;//return callback(err);
        else{
            if(!userItem) return callback(null, null);
            return callback(null, userItem.sockets[0]);
        }
    })
};


/*
* Добавляет идентификатор подключения socketItem{id, type} для пользователя с userId
* на вход получает userId и объект socketItem{id, type}
* Если такой сокет есть или добавление произошло успешно - передает в callback(null)
* Если ошибка  - передает ошибку в callback(err)
 */
sockets.statics.addToList = function(userId, socketItem, callback){
    var sockets = this;
   async.waterfall([
       function(callback){
           sockets.getSocketByUserIdAndId(userId, socketItem.id, callback);
       },
       function(socket, callback){
           /*
            * Есть 3 случая:
            * 1) Нет сокета - добавляем новый с типом
            * 2) Сокет есть, но нет типа - добавляем тип
            * 3) Сокет есть с типом - ничего не делаем

            */

           if(socket){
               //сокет есть, 2 или 3 кейс
               if(socket.cType.indexOf(socketItem.cType) > 0){
                   // тип есть, кейс 3
                    callback(null);
               }else{
                   //типа нет, кейс 2
                   sockets.findOneAndUpdate(
                       {
                           userId:userId, "sockets.id": socketItem.id
                       },
                       {
                           $push:{
                               "sockets.$.cType":socketItem.cType
                           }
                       },
                       callback
                   )
               }
           }else{
               sockets.findOneAndUpdate(
                   {
                       userId:userId
                   },
                   {
                       $push:{
                           "sockets" :socketItem
                       }
                   },
                   callback
               )
           }



       }
   ], function(err){

       if(err) return callback(new dbError(err));
       else{
           return callback(null);
       }
   })

};


/*
 * Добавляет нового пользователя онлайн в коллекцию onlineUsers
 * На вход принимает userId и socketItem{id, type}
 * В случае успешного выполнения передает в callback только что добавленный объект callback(null, newOnlineUser).
 * В случае ошибки передает err в callback(err)
 */
sockets.statics.addNewUser = function(userId, socketItem, callback){
    var newOnlineUser = new this({
        userId: userId,
        sockets: [socketItem]
    });
    newOnlineUser.save(function(err, newOnlineUser){
        if(err) return callback(new dbError(err));
        else{
            callback(null, newOnlineUser);
        }
    });
};


/*
 * Удаляет всю сущность onlineUser
 * на вход получает только userId, для которого нужно удалить сущность
 * В случае успешного выполнения передает в callback(null)
 * В случае ошибки передает в callback(err)
 */
sockets.statics.removeUserItem = function(userId, callback){
   this.remove({userId: userId}, function(err){
       if(err) return callback(new dbError(err));
       else{
           return callback(null);
       }
   })
};

/*
 * Удаляет конкретный сокет из списка sockets
 * на вход получает имя пользователя и идентификатор сокета
 * В случае успешного выпонения передает в callback(null)
 * В случае ошибки передает callback(err)

 */
sockets.statics.removeSocketFromList = function(userId, socketId, callback){
   this.update(
        {
            userId: userId,
            "sockets.id":socketId
        },
        {
            $pull:{
                sockets: {id:socketId}
            }
        },
        function(err){
            if(err) return callback(new dbError(err));
            else{
                return callback(null);
            }
        }
    )
};



/*
 * Удаляет конкретный socketType у конкретного сокета из списка sockets
 * на вход получает идентификатор пользователя, идентификатор сокета и тип
 * В случае успешного выпонения передает в callback(null)
 * В случае ошибки передает callback(err)
 */
sockets.statics.removeSocketTypeFromSocket = function(userId, socketId, socketType, callback){
    this.update(
        {
            userId:userId,
            "sockets.id":socketId
        },
        {
            $pull:{
                "sockets.$.cType": socketType
            }
        },
        function(err){
            if(err) return callback(new dbError(err));
            else{
                return callback(null);
            }
        }
    )
};


/*
 * Проверяет наличие сокетов для юзера
 * на вход получает идентификатор пользователя
 * В случае успешного выпонения передает в callback(null,true/false)
 * В случае ошибки передает callback(err)
 */
sockets.statics.checkIfUserOnline = function(userId, callback){
    this.findOne({userId: userId}, function(err, user){
        if(err) return callback(new dbError(err));
        else{
            if(user){
                return callback(null, true);
            }else{
                return callback(null, false);
            }
        }
    })
};



exports.sockets = mongoose.model('sockets', sockets);
