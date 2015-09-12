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
                    onlineUsers.removeFromList(socket.request.headers.user.id, function(err){
                        if(err) console.error(err);
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
            console.log(users);
            checkIfUserOnline(users[i], function(err, socketId){
                if(socketId){
                    console.log('сокетNд ' + socketId);
                    var notificationItem = {
                        to: users[i],
                        eventName: notification.eventName,
                        body: notification
                    }
                    console.log(notificationItem.to);
                    addNotificationToQueue(notificationItem);
                }
                console.log('no socketId');
            });

        }
    }
    function checkIfUserOnline (userId, callback){
        console.log('проверяем онлайн ли юзер');
        onlineUsers.checkIfUserOnline(userId, function(err, socketId){
            if(socketId) return callback(null,socketId);
            return callback(err);
        })
    }

    function addNotificationToQueue(notificationItem){
      // добавление нотификации в очередь для отправки
        console.log(queue + " - очередь пушей")
        queue.push(notificationItem);
        if(queue.length == 1) { ee.emit('start')}
        if(queue.length > 30) { ee.emit('warning', "Очень много уведомлений: " + queue.length)}
    }

    function sendNotification(notificationItem){   //отправка нотификации
        console.log("Отправляю нотификацию");
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