var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var nsItem = require('../../notificationService/nsInterface').nsItem;
var mmws = require('../../conversation/imInterface').mmws;

var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require('async');


//TODO проверить данный обработчик когда будет необходимость в нем

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
           var tasks = [];
	       try{
		       data.convsId.forEach(function(element){
			       tasks.push(createTaskToSendMessage(element, socket.request.headers.user.id, data.message));
		       });
	       }catch(e){
		       return cb(new wsError(400, "Некорректный запрос"));
	       }
			async.parallel(tasks, callback);
       },

       function(results, callback){
	       results.forEach(function(messageItem, index){

		       if(messageItem){
			       var options ={
				       attachments: messageItem.attachments,
				       convId: data.convsId[index]
			       };
			       var mmwsItem = new mmws(data.convsId[index], socket.request.headers.user.id, messageItem, "newMessage", options);

			       var ns = new nsItem("imNewMessage", socket.request.headers.user.name + " " + socket.request.headers.user.surname, messageItem.text, socket.request.headers.photo, options);

			       ns.send(messageItem.unread);
			       mmwsItem.sendToGroup(messageItem.unread);
			       return callback(null, messageItem);
		       }
	       })

       }
   ],function(err, messageItem){
        if(err){
            var wsEr;
            if(err instanceof dbError){
                wsEr = new wsError(err.code, err.message);
                return cb(wsEr.sendError());
            }else if(err instanceof wsError){
               return cb(err.sendError());
            }else{
                wsEr = new wsError();
               return cb(wsEr.sendError());
            }
        }else{
            return cb(messageItem);
        }
   })
};



function createTaskToSendMessage(convId, sender, rawMessage){
	return function(callback){
		conversation.addMessage(convId, sender, rawMessage, callback);
	}

}