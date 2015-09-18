var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var onlineUsers = require('../common/listOfOnlineUsers').onlineUsers;
var async = require('async');
var dialogStorage = require('./dialogsStorage').dialogs;




imServiceEE.on('warning', function(message){
    console.warn(message);
})


function imService(ee){

    var queue = [];
    var channel;
    var self = this;

    this.start = function(io){
        var dialogServiceTransport = io.of('/dialogs');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            socket.emit('dialog', {message: "Диалоги"});
            socket.on('disconnect', function () {
                console.log("Connection lost -> dialogs");
            });


        });
    };

    this.createDialog = function(socket, creator, participants, title){
        dialogStorage.createDialog(creator, participants, title, function(err, dialog){
            if(err) throw err;
            else{
                if(dialog) {
                    self.subscribeTo(dialog._id, socket);

                    var message = socket.user.username + "создал диалог.";

                    //channel.to(dialog._id).emit('joinDialog', )
                }else{
                    ee.emit('warning', "После создания диалога диалог из бд не вернулся " + creator);
                }
            }
        })
    }

    this.sendMessage = function(socket, message, dialogId){

    }

    this.subscribeTo = function(dialogid, socket){
        socket.join(dialogid);
    }

    this.addParticipantsToDialog = function(participants, dialogId, callback){
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
            if(err) task(participant, dialogId)
        })
    }
    return task;
}
