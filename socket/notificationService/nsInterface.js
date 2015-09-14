var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();
var onlineUsers = require('./../common/listOfOnlineUsers').onlineUsers;
var async = require('async');

notificationServiceEE.on('start', function(){
    console.log('start emit ns')
    ns.sendingNotification();
});
notificationServiceEE.on('finish', function(){
    console.log('Отослал все уведомления, новых пока нет');
});

notificationServiceEE.on('warning', function(message){
    console.warn(message);
})


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

                    });
                }

                console.log("Connection lost -> notifications");
            });
        });
    };

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


    function addNotificationToQueue(notificationItem){
      // добавление нотификации в очередь для отправки
        queue.push(notificationItem);
        if(queue.length == 1) { ee.emit('start')}
        if(queue.length > 30) { ee.emit('warning', "Очень много уведомлений: " + queue.length)}
    }
    this.sendingNotification = function(){
        console.log("this.sendingNotification");
        console.log(queue);
        while(queue.length > 0){
            var notificationItem = queue[0];
            channel.connected[notificationItem.to].emit(notificationItem.eventName, notificationItem.body);
            queue.shift();
            if(queue.length == 0) ee.emit('finish');
        }
    }


    function makeCheckUserOnline(user){
        return function(callback) {
            onlineUsers.checkIfUserOnline(user, function(err, socketId){
                if(!socketId){
                    console.log("Юзер не онлайн");
                    return callback(new Error('Юзер не онлайн'));
                }
                if(socketId.length > 0){
                    console.log('Добавил нотификации в очередь');
                    return callback(null, socketId);
                }

            });
        }
    }
}

var ns = new notificationService(notificationServiceEE);

exports.ns = ns;

