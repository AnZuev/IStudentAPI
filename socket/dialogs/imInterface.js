var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var onlineUsers = require('../common/listOfOnlineUsers').onlineUsers;
var async = require('async');
var dialogStorage = require('./dialogsStorage').dialogs;
var User = require('../../models/User').User;
var DbError = require('../../error').DbError;




imServiceEE.on('warning', function(message){
    console.warn(message);
})


function imService(ee){

    var channel;

    this.start = function(io){
        var dialogServiceTransport = io.of('/im');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            console.log('Соединение установлено -> im');
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
                console.log('=================== createDialog =============');

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
                console.log("Connection lost -> dialogs");
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

                var length = participants.length;
                while(length > 0){
                    console.log("Step %d : ", length);
                    var currentUser = participants.pop();

                    tasks.push(createTaskToAddContacts(currentUser, participants));
                    participants.unshift(currentUser);
                    length--;
                    console.log("================")
                }
                async.parallel(tasks, function(err, results){
                    if(err) throw err;//return callback(err);
                    else {
                        console.log('------------------------------------ async parallel add contacts');
                        console.log(arguments);
                        console.log('------------------------------------ async parallel add contacts');

                        return callback(null, true)
                    }
                });
            }
        ], function(err,result){
            if(err) throw err;
            else{
                console.log(arguments);
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
        //console.log(tasks);
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
                            channel.connected[sockets[i]].join(dialogId);
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
    console.log("!!!!" + participants);
    return function(callback){
        console.log("_------" + participants);
        User.addContacts(userTo, participants, callback);
    }
}

function addContacts (creator, participants, callback){
    var tasks = [];
    var newContacts = [];
    newContacts.push(creator);
    while(participants.length > 0){
        newContacts.push(participants.pop());
    }
    var length = participants.length;
    while(length > 0){
        var currentUser = participants.pop();
        tasks.push(createTaskToAddContacts(currentUser, participants));
        participants.unshift(currentUser);
        length--;
    }
    async.parallel(tasks, function(err, results){
        if(err) throw err//return callback(err);
        else return callback(null, true)
    });
}


// пока не используются
function makeTasksForAddindParticipants(newParticipant, dialogId){
    var errorsCounter = 0;
    var task = function(participant, dialogId, callback){
        dialogStorage.addParticipant(dialogId, participant, function(err, dialog){
            if(err) {
                errorsCounter++;
                if(errorsCounter < 5) task(participant, dialogId);
                else{
                    return callback(new Error('Не удалось добавить участника в диалог'))
                }

            }
            else{
                return callback(null, dialog);
            }
        })
    }
    return task;
}

function subscribeTo(dialogid, userId){
    onlineUsers.checkIfUserOnline(userId, function(err, sockets){
        if(err) throw err;
        else{
            if(sockets){
                console.log(sockets);
                for(var i = 0; i< sockets.length; i++){
                    channel.connected[sockets[i]].join(dialogid);
                }
            }else{

            }

        }
    })
} // нужен для подписки юзера на подключение к комнате
