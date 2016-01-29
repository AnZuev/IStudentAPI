var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var nsItem = require('../../notificationService/nsInterface').nsItem;
var mmws = require('../../conversation/imInterface').mmws;

var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;

var async = require('async');


var libs = require('../libs');

/*
 1) Проверяем существует ли пользователь
 2) Если не существует - посылаем
 3) Проверяем есть ли беседа в таком составе. Если есть - пишем туда сообщение и отдаем ее пользователю
 4) Если беседы нет - создаем, потом пишем туда сообщение, потом отправляем юзеру

 */
module.exports = function(socket, data, cb){
   async.waterfall([
       function(callback){
	       if(!data.userId) return cb(new wsError(400, "Недостаточно данных для создания беседы"));
           User.getUserById(data.userId, callback);
       },
       function(user, callback){
           if(!user){
                return callback(new wsError(400, "Нельзя создать беседу"));
           }else{
               conversation.createPrivateConversation(data.userId, socket.request.headers.user.id, function(err, conv){
                   if(err) return callback(err);
                   else{
                       return callback(null, conv, user)
                   }
               });
           }
       },
       function(conv, user, callback){
           if(!conv) callback(new dbError(null, 500, "После добавления не вернулась беседа"));

           libs.loadPrivateConvInfo(conv, socket.request.headers.user.id, function(err, conv){
               if(err) return callback(err);
               else{ return callback(null, conv, user)}
           })
       },
       function(conv, user, callback){
           var messageItem = {};
           if(data.message){
               if(!(data.message.text || data.message.attachments)){
                   return callback(null, conv, null, user);
               }
               if(data.message.attachments){
                   if(data.message.attachments.length > 5){
                       data.message.attachments = data.message.attachments.slice(0, 5);
                   }
                   messageItem.attachments = data.message.attachments;
               }
               if(data.message.text){
                   messageItem.text = data.message.text;
               }
               conversation.addMessage(conv._id, socket.request.headers.user.id, messageItem, function(err){
                   if(err) callback(err);
                   else{
                       conv.messages.push(messageItem);
                       callback(null, conv, messageItem, user);
                   }
               });
           }else{
               callback(null, conv, null, user);
           }
       },
       function(conv, messageItem, user, callback){
           if(!messageItem) return callback(null, conv);
	       var options ={
               attachments: messageItem.attachments,
               convId: conv._id
           };
           var mmwsItem = new mmws(conv._id, socket.request.headers.user.id, messageItem, "newMessage", options);

           var ns = new nsItem("imNewMessage", socket.request.headers.user.name + " " + socket.request.headers.user.surname, messageItem.text, socket.request.headers.photo, options);
           var res = [];
           res.push(user._id);
           ns.send(res);
           mmwsItem.sendToGroup(res);
           return callback(null, conv)
       }
   ],function(err, conv){
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
            cb(conv);
        }
   })
};