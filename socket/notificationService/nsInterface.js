var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();
var onlineUsers = require('./../common/listOfOnlineUsers').onlineUsers;



function notificationService(ee){

    var queue = [];
    var channel;

    this.startNotificationService = function(io){
        var notificationServiceTransport = io.of('/notifications');
        channel = notificationServiceTransport;
        notificationServiceTransport.on('connection', function (socket) {
            console.log('Соединение установлено -> notifications');
            socket.emit('news', {message:"Новости"});
            socket.on('disconnect', function () {
                if(socket.request.headers.user.id){
                    onlineUsers.remove(socket.request.headers.user.id, function(err, callback){
                        if(err) return callback(err);
                        else{
                            console.log('Запись из списка юзеров онлайн успешно удалена');
                        }
                    });
                }

                console.log("Connection lost -> notifications");
            });
        });
    };
    this.makeListOfRecievers = function(users, notification){
        console.log("Начинаю добавлять нотификацию для юзера" + notification);
        for(var i = 0; i< users.length; i++ ){
            var socketId = checkIfUserOnline(users[i]);
            if(socketId){
                var notificationItem = {
                    to: users[i],
                    eventName: notification.eventName,
                    body: notification
                }
                addNotificationToQueue(notificationItem);
            }
        }
    }
    function checkIfUserOnline (userId){
        onlineUsers.checkIfUserOnline(userId, function(err, socketId){
            if(socketId) return socketId;
            return false;
        })
    }

    function addNotificationToQueue(notificationItem){   // добавление нотификации в очередь для отправки
        queue.push(notificationItem);
        if(queue.length == 1) { ee.emit('start')}
        if(queue.length > 30) { ee.emit('warning', "Очень много уведомлений: " + queue.length)}
    }

    function sendNotification(notificationItem){   //отправка нотификации
        channel.connected[notificationItem.to].emit(notificationItem.eventName, notificationItem.body);
        queue.unshift();
        if(queue.length == 0) ee.emit('finish');

    }

    this.sendingNotification = function(){
        while(queue.length >0){
            setInterval(function(){
                sendNotification(queue[0])
            }, 500);
        }

    }


}

var ns = new notificationService(notificationServiceEE);
exports.ns = ns;