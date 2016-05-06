/**
 * Created by anton on 24/01/16.
 */


var async = require('async');
var htmlSpecialChars = require('htmlspecialchars');
var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation/index').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;
var nsItem = require('../../notificationService/nsInterface').nsItem;
var mmws = require('../../conversation/imInterface').mmws;

var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;



var libs = require('../libs/libs');
require('../../../libs/additionalFunctions/extensionsForBasicTypes');



/*
 1) Проверяем существуют ли пользователи
 2) Если все существуют - все хорошо, если есть те,которые не существуют - удаляем их из массива
 4) Создаем беседу, потом пишем туда сообщение, потом отправляем юзерам

 */

module.exports = function(socket, data, cb){
    var title,participants;
    try{
        title = htmlSpecialChars(data.title);
        participants = data.participants;
        participants.unique();
        if(participants.indexOf(socket.request.headers.user.id) < 0) participants.push(socket.request.headers.user.id);
    }catch(e){
	    var err = new wsError(400);
        cb(err.sendError());
	    return;
    }
    async.waterfall([
        function(callback){
            var tasks = [];
            participants.forEach(function(element){
                tasks.push(createTaskToCheckUser(element));
            });
            async.parallel(tasks, callback);
        },
        function(users, callback){
            users.forEach(function(userItem, index){
                if(!userItem){
                    users.splice(index, 1);
                }
            });

            if(users.length < 3){
                return callback(new wsError(400, "Not enough users for group conversation"));
            }else{
                conversation.createGroupConversation(title, socket.request.headers.user.id, "", users, function(err, conv){
                    if(err) return callback(err);
                    else{
                        return callback(null, conv, users)
                    }
                });
            }
        },
        function(conv, users, callback){
	        var messageItem = {};
	        try{
		        if(data.message.text.length > 0){
			        messageItem = {
				        text: htmlSpecialChars(data.message.text)
			        };
		        }
	        }catch(e){

	        }
	        if(messageItem){

		        conversation.addMessage(conv._id, socket.request.headers.user.id, messageItem, function(err, messageItemUpdated, convUpdated){
			        if(err) return callback(err);
			        else{

				        conv.messages = convUpdated;
				        return callback(null, conv, messageItem, users);
			        }
		        });
	        }else{
		        return callback(null, conv,  null, users);
	        }
        },
	    function(conv, messageItem, users, callback){
		    if(!conv) callback(new dbError(null, 500, "После добавления не вернулась беседа"));

		    libs.loadGroupConvInfo(conv, socket.request.headers.user.id, function(err, convWithParts){

			    if(err) return callback(err);
			    else return callback(null, convWithParts, messageItem, users);

		    })
	    },
        function(conv, messageItem, users, callback){
	        if(messageItem){
		        var options ={
			        convId: conv._id
		        };
		        var mmwsItem = new mmws(conv._id, socket.request.headers.user.id, messageItem, "newMessage", options);

		        var ns = new nsItem("imNewMessage", socket.request.headers.user.name + " " + socket.request.headers.user.surname, messageItem.text, socket.request.headers.photo, options);
		        users.splice(users.indexOf(socket.request.headers.user.id), 1);
		        ns.send(users);
		        mmwsItem.sendToGroup(users);
		        return callback(null, conv)
	        }

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
                wsEr = new wsError(500);
                cb(wsEr.sendError());
            }
        }else{
            cb(conv);
        }
    })
};


function createTaskToCheckUser(userId){
    return function(callback){
        User.getUserById(userId, callback);
    }
}

