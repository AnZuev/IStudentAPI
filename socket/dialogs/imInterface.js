var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var onlineUsers = require('../common/listOfOnlineUsers').onlineUsers;
var async = require('async');
var dialogStorage = require('./../../models/dialogsStorage').dialogs;
var User = require('../../models/User').User;
var DbError = require('../../error').DbError;
var addSocketToDB = require('../common/libs').addSocketToDB;




imServiceEE.on('warning', function(message){
    console.warn(message);
});


function imService(ee){

    var channel;

    this.start = function(io){
        var dialogServiceTransport = io.of('/im');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            console.log('Соединение установлено -> im');
            setTimeout(function(){
                addSocketToDB(socket.id, socket.handshake.headers.user.id, "im", function(err){
                    if(err) throw err;
                });
                socket.emit('dialog', {message: socket.request.headers.user});
                //обработчики событий
                socket.on('newMessage', function(data, cb){
                    sendMessage(socket, data.message, data.dialogId, function(err, result){
                        if(err) {
                            cb(false);
                            throw err;
                        }
                        else{
                            console.log(result);
                            cb(true)
                        }
                    });
                });

                socket.on('createDialog', function(data, cb){
                    createDialog(socket, socket.request.headers.user.id, data.participants, data.title, function(err, result){
                        if(err) {
                            var errorInstance = {
                                description:err.message,
                                code: err.status,
                                exception: true
                            };
                            return cb(errorInstance);
                        }
                        else{
                            return cb(result)
                        }
                    })
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
                socket.on('getMessages', function(data, cb){
                    dialogStorage.getMessagesForDialog(data.imId, socket.request.headers.user.id, data.skip, function(err, messages){
                        if(err) cb({exception: true, reason: "No dialogs found"});
                        else{
                            messages.skip = data.skip;
                            cb(messages);
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
                })
                socket.on('disconnect', function () {
                    onlineUsers.removeSocketTypeFromSocket(socket.request.headers.user.id, socket.id, "im", function(err, imItem){
                        if(err) throw err;
                        console.log("Connection lost -> dialogs");

                    })
                });

            },1000); // подумать из-за чего без этой задержки все валится

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


