/**
 * Created by anton on 24/01/16.
 */
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
 1) Проверяем существуют ли пользователи
 2) Если все существуют - все хорошо, если есть те,которые не существуют - удаляем их из массива
 4) Создаем беседу, потом пишем туда сообщение, потом отправляем юзерам

 */
module.exports = function(socket, data, cb){
    var title,participants;
    try{
        title = data.title;
        participants = data.participants;
        participants.unique();
        if(participants.indexOf(socket.request.headers.user.id) < 0) participants.push(socket.request.headers.user.id);

    }catch(e){
        throw e;
        var wsEr = new wsError(400);
        return cb(wsEr.sendError());
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

            if(!users.length){
                return callback(new wsError(400, "Нельзя создать беседу"));
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
            if(!conv){
                callback(new dbError(null, 500, "После добавления не вернулась беседа"));
            }else{
                if(data.message.text.length > 0){
                    if(data.message.attachments.length > 5){
                        data.message.attachments = data.message.attachments.slice(0, 5);
                    }
                    var messageItem = {
                        attachments:data.message.attachments,
                        text: data.message.text
                    };
                    conversation.addMessage(conv._id, socket.request.headers.user.id, messageItem, function(err){
                        if(err) callback(err);
                        else{
                            conv.messages.push(messageItem);
                            callback(null, conv, messageItem, users);
                        }
                    });
                }
            }
        },
        function(conv, messageItem, users, callback){

            var options ={
                attachments: messageItem.attachments,
                convId: conv._id
            };
            var mmwsItem = new mmws(conv._id, socket.request.headers.user.id, messageItem, "newMessage", options);

            var ns = new nsItem("imNewMessage", socket.request.headers.user.name + " " + socket.request.headers.user.surname, messageItem.text, socket.request.headers.photo, options);
            users.splice(users.indexOf(socket.request.headers.user.id), 1);
            ns.send(users);
            mmwsItem.sendToGroup(users);
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


function createTaskToCheckUser(userId){
    return function(callback){
        User.getUserById(userId, callback);
    }
}

