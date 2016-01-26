/**
 * Created by anton on 25/01/16.
 */

var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;



/*
 1) Вызываем метод базы данных getMessages
 2) Если ошибка - возвращаем wsError c кодом 400
 3) Если беседа не найдена  - возвращаем  wsError с кодом 403
 4) Если длина сообщение равна 0 - возвращаем wsError c кодом 204
 5) В противном случае отдаем conv


 */
module.exports = function(socket, data, cb){
  conversation.getMessages(data.convId, socket.request.headers.user.id, data.skipFromEnd, function(err, conv){
      if(err) return cb(new wsError(400).sendError());
      else{
          if(conv){
              if(conv.messages.length == 0) return cb(new wsError(204, "No messages"));
              else return cb(conv);
          }else{
              return cb(new wsError(403, "Forbidden"))
          }

      }
  });

};