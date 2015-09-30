var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var onlineUsers = require('../common/listOfOnlineUsers').onlineUsers;
var async = require('async');
var dialogStorage = require('./dialogsStorage').dialogs;




imServiceEE.on('warning', function(message){
    console.warn(message);
})


function imService(ee){

    var channel;
    var self = this;

    this.start = function(io){
        var dialogServiceTransport = io.of('/im');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            socket.emit('dialog', {message: socket.user});
            console.log('Connection enabled -> dialogs')
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
                createDialog(socket, socket.user.id, data.participants, data.title, function(err, result){
                    if(err) throw err;
                    else{
                        cb(result)
                    }
                })
            });
            socket.on('disconnect', function () {
                console.log("Connection lost -> dialogs");
            });


        });


    };

    function createDialog(socket, creator, participants, title, callback){
        dialogStorage.createDialog(creator, participants, title, function(err, dialog){
            if(err) {
                return callback(err);
            }
            else{
                if(dialog) {
                    subscribeTo(dialog._id, socket);
                    var messageItem = {
                        message:socket.user.username + " создал диалог.",
                        sender: socket.user.id,
                        photoUrl: socket.user.photoUrl
                    };
                    channel.to(dialog._id).emit('joinDialog', messageItem);
                    return callback(null, dialog._id);
                }else{
                    ee.emit('warning', "После создания диалога диалог из бд не вернулся " + creator);
                    return callback("Ошибка!!!!!!!! Не может быть!")
                }
            }
        })
    }

     function sendMessage (socket, message, dialogId, callback){
        dialogStorage.addMessage(dialogId, socket.request.headers.user.id, message, function(err, messageItem){
            if(err) return callback(err);
            else{
                messageItem.dialogId = dialogId._id;
                channel.to(dialogId._id).broadcast('newMessage', messageItem);
                return callback(null, true);
            }
        })
    }

    function subscribeTo(dialogid, socket){
        onlineUsers.checkIfUserOnline(socket.user.id, function(err, sockets){
            if(err) throw err;
            else{
                for(var i = 0; i< sockets.length; i++){
                    sockets[i].join(dialogid);
                }
            }
        })
    }

    function addParticipantsToDialog (participants, dialogId, callback){

    }


    this.makeListOfRecievers = function(users, notification){

        async.waterfall([
            function(callback){
                console.log("Начинаю добавлять нотификацию для юзера" + notification);
                var tasks = [];
                for(var i = 0; i< users.length; i++ ){
                    tasks.push(makeCheckUserOnline(users[i]));
                }
                async.series(tasks, callback)
            },
            function(results, callback){
                console.log(results);
                for(var i = 0; i<results.length; i++){
                    if(results[i].length > 0){
                        var notificationItem = {};
                        for(var y = 0; y< results[i].length; y++){
                            notificationItem = {
                                to: results[i][y],
                                eventName: notification.eventName,
                                body: notification
                            }
                            addNotificationToQueue(notificationItem);
                        }
                    }
                }
                return callback(null);


            }
        ])

    }





}

var im = new imService(imServiceEE);

exports.im = im;


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
