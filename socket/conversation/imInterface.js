var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var sockets = require('../common/sockets').sockets;
var async = require('async');
var dialogStorage = require('./../../models/conversation').conversation;
var User = require('../../models/User').User;
var dbError = require('../../error').dbError;
var addSocketToDB = require('../common/libs').addSocketToDB;
var log = require('../../libs/log')(module);

var taskToGetUserSockets = require('./../common/libs').taskToGetUserSockets;






imServiceEE.on('warning', function(message){
   log.warn(message);
});


function imService(ee){

    var channel;

    this.start = function(io){
        var dialogServiceTransport = io.of('/im');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            log.debug('Начинаю установку соединения ws::im');


            socket.on('createPrivateConversation', function(data, cb){
                require('./handlers/createPrivateConversation')(socket, data, cb);
            });


            socket.on('createGroupConversation', function(data, cb){
                require('./handlers/createGroupConversation')(socket, data, cb);
            });

            socket.on('sendMessage', function(data, cb){
                require('./handlers/sendMessageToOneConversation')(socket, data, cb);
            });

            socket.on('getMessages', function(data, cb){
                require('./handlers/getMessages')(socket, data, cb);
            });

            socket.on('loadConv', function(data, cb){
                require('./handlers/loadConv')(socket, data, cb);
            });


            socket.on('startTyping', function(data){
                    var startTypingInstance = {
                        dialogId: data.dialogId,
                        username: socket.user.username
                    };
                    socket.broadcast.to(data.dialogId).emit('startTyping', startTypingInstance);
                });
            socket.on('stopTyping', function(data){
                var stopTypingInstance = {
                    dialogId: data.dialogId,
                    username: socket.user.username
                };
                socket.broadcast.to(data.dialogId).emit('stopTyping', stopTypingInstance);
            });
            socket.on('getDialog', function(data, cb){
                dialogStorage.getDialogById(data.dialogId, socket.request.headers.user.id, function(err, imItem){
                    if(imItem) cb(imItem);
                    else{
                        if(err){
                            cb({exception: true, reason: err.code});
                        }else{
                            cb({exception: true, reason: "No dialogs found"});
                        }
                    }
                })
                });

            socket.on('findContacts', function(data, cb){
                findFriends(data.key1, data.key2, function(err, users){
                    if(err){
                        if(err instanceof DbError){
                            console.log(err);
                            cb(false);
                        }
                        else{
                            cb(false)
                            throw err;
                        }
                    }else{
                        cb(users);
                    }
                })
            });

            socket.on('connection:accepted', function(){
                log.debug('Событие connection:accepted сработало');
                addSocketToDB(socket.id, socket.handshake.headers.user.id, "im", function(err){
                    if(err) throw err;
                    log.debug('Соединение установлено -> im. Socket успешно добавлен');
                });
            });


        });


    };

    function createDialog(socket, creator, participants, title, callback){
        var handshakeData = socket.request.headers;
        participants.push(creator);
        async.series([
            function(callback){
                dialogStorage.createDialog(creator, participants, title, function(err, dialog){
                    if(err) {
                        return callback(err);
                    }
                    else{
                        if(dialog) {
                            var messageItem = {
                                id: dialog._id,
                                message:handshakeData.user.username + " создал диалог.",
                                sender: handshakeData.user.id,
                                photoUrl: handshakeData.user.photoUrl
                            };
                            //sendMessage()
                            subscribeToArray(dialog._id, dialog.participants, function(err){
                                if(err) {
                                    throw err;
                                }
                                else {

                                    channel.to(dialog._id).emit('dialogCreated', messageItem);
                                    return callback(null, dialog);
                                }
                            });


                        }else{
                            ee.emit('warning', "После создания диалога диалог из бд не вернулся " + creator);
                            return callback({message: "Произошла ошибка: из бд по каким-то причинам не вернулся диалог, который был " +
                                "создан без ошибок", status: 5399});
                        }
                    }
                });
            },
            function(callback){
                var tasks = [];
                var task;
                var length = participants.length;
                while(length > 0){
                    var currentUser = participants.pop();
                    task = createTaskToAddContacts(currentUser, participants);
                    tasks.push(task);
                    console.log(task);
                    participants.unshift(currentUser);
                    length--;
                }
                async.parallel(tasks, function(err, results){
                    if(err) return callback(err);
                    else {

                        return callback(null, true)
                    }
                });
            }
        ], function(err,result){
            if(err) throw err;
            else{
                console.log("Создание диалога завершилось без ошибок");
                return callback(null, true);
            }
        })
    }

    function sendMessage (socket, message, dialogId, callback){
        dialogStorage.addMessage(dialogId, socket.request.headers.user.id, message, function(err, messageItem){
            if(err) return callback(err);
            else{
                messageItem.dialogId = dialogId;
                messageItem.sender.id = messageItem.sender;
                messageItem.sender.photo = socket.request.headers.user.photo;
                socket.broadcast.to(dialogId).emit('newMessage', messageItem);
                return callback(null, true);
            }
        })
    }

    function subscribeToArray(dialogId, users, callback){  // нужен для подписки массива юзеров на подключение к комнате
        var tasks = [];
        for (var y = 0; y< users.length; y++){
            var task = createFunctionToSubscribe(dialogId, users[y]);
            tasks.push(task);
        }
        async.parallel(tasks, function(err){
            if(err) return callback(err);
            else{
                return callback(null)
            }
        });
    }

    function createFunctionToSubscribe(dialogId, userId){
        return function(callback){
            onlineUsers.checkIfUserOnline(userId, function(err, sockets){
                if(err) throw err;
                else{
                    if(sockets){
                        for(var i = 0; i< sockets.length; i++){
                            console.log(channel.connected[sockets[i].id]);

                            channel.connected[sockets[i].id].join(dialogId);
                        }
                    }
                    return callback(null, true);

                }
            })
        }
    }

    function findFriends(key1, key2, callback){
        if(key1){
            if(key2){
                User.getFriendsByTwoKeys(key1, key2, callback);
            }else{
                User.getFriendsByOneKey(key1, callback);
            }
        }else{
            callback(false);
        }
    }  // поиск по контактам(по диалогам)


    function mmws(convId, sender, message, eventName, options){
        this.title = sender.name + " " + sender.surname;
        this.photo = sender.photo;
        this.text = message.text;
        this.convId = convId;
        this.options = options;
        this.eventName = eventName;
        var self = this;

        this.sendToGroup = function(recievers){
            async.waterfall([
                function (callback) {
                    var tasks = [];
                    for (var i = 0; i < recievers.length; i++) {
                        tasks.push(taskToGetUserSockets(recievers[i], "im"));
                    }
                    async.parallel(tasks, callback);
                },
                function (results, callback) {
                    for (var i = 0; i < results.length; i++) {
                        if(!results[i]) continue;
                        if (results[i].length > 0) {
                            var mmwsItem = {};
                            for (var y = 0; y < results[i].length; y++) {
                                mmwsItem = {
                                    eventName: self.eventName,
                                    convId: self.convId,
                                    title: self.title,
                                    photo: self.photo,
                                    text: self.text,
                                    options: options,
                                    senderId: sender.id
                                };
                                channel.connected[results[i][y].id].emit(mmwsItem.eventName, mmwsItem);
                            }
                        }
                    }
                    return callback(null);
                }
            ],function(err){
                if(err) throw err;
            });
            return 0;
        }
    }
    exports.mmws = mmws;

}
var im = new imService(imServiceEE);

exports.im = im;



function createTaskToAddContacts (userTo, participants){
    var contacts = participants.slice();
    return function(callback){
        console.log("_------" + contacts);
        User.addContacts(userTo, contacts, callback);
    }
}

