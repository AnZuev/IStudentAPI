var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var nsItem = require('../../notificationService/nsInterface').nsItem;
var mmws = require('../../conversation/imInterface').mmws;

var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require('async');


/*
 1) Проверяем существует ли пользователь
 2) Если не существует - посылаем
 3) Проверяем есть ли беседа в таком составе. Если есть - пишем туда сообщение и отдаем ее пользователю
 4) Если беседы нет - создаем, потом пишем туда сообщение, потом отправляем юзеру

 */
module.exports = function(socket, data, cb){
    var rawMessage = {};
    try{
        rawMessage.text = data.text;
        if(rawMessage.length == 0) cb(false);
        rawMessage.attachments = data.attachments;


    }catch(e){
        var wsEr = new wsError(400);
        return cb(wsEr.sendError());
    }

   async.waterfall([
       function(callback){
           conversation.addMessage(data.convId, socket.request.headers.user.id, rawMessage, callback);
       },

       function(messageItem, callback){
           if(!messageItem){
               callback(new dbError(null, 500, "После добавления сообщение сообщение не вернулось"));
           }else{
               var options ={
                   attachments: messageItem.attachments,
                   convId: data.convId
               };
               var mmwsItem = new mmws( data.convId, socket.request.headers.user, messageItem, "newMessage", options);
	           var title = socket.request.headers.user.name + " " + socket.request.headers.user.surname;
               var ns = new nsItem("imNewMessage", title, messageItem.text, socket.request.headers.photo, options);

               ns.send(messageItem.unread);
               mmwsItem.sendToGroup(messageItem.unread);
               return callback(null, messageItem);
           }
       }
   ],function(err, messageItem){
        if(err){
            var wsEr;
            if(err instanceof dbError){
                wsEr = new wsError(err.code, err.message);
                cb(wsEr.sendError());
            }else if(err instanceof wsError){
                cb(err.sendError());
            }else{
                wsEr = new wsError();
                cb(wsEr.sendError());
            }
        }else{

            cb(messageItem);
        }
   })
};