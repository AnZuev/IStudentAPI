var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();
var onlineUsers = require('./../common/listOfOnlineUsers').onlineUsers;
var taskToGetUserSockets = require('./../common/libs').taskToGetUserSockets;

var async = require('async');

notificationServiceEE.on('start', function(){
    console.log('start emit ns');
    ns.startSending();
});
notificationServiceEE.on('finish', function(){
    console.log('Отослал все уведомления, новых пока нет');
});

notificationServiceEE.on('warning', function(message){
    console.warn(message);
});

function nsItem(eventName, title, message, photoUrl, adds){
    var self = this;
    this.eventName = eventName;
    this.title = title;
    this.message = message;
    this.photoUrl = photoUrl || "http://pre-static.istudentapp.ru/images/noAvatar.png";
    for(var key in adds) {
        if (!this.hasOwnProperty([key])) this[key] = adds[key];
    }
    this.send = function(users){
        async.waterfall([
            function (callback) {
                var tasks = [];
                for (var i = 0; i < users.length; i++) {
                    tasks.push(taskToGetUserSockets(users[i]));
                }
                async.parallel(tasks, callback);
            },
            function (results, callback) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].length > 0) {
                        var notificationItem = {};
                        for (var y = 0; y < results[i].length; y++) {
                            notificationItem = {
                                to: results[i][y],
                                eventName: self.eventName,
                                body: {

                                }
                            };
                            for(var key in self) {
                                if (!notificationItem.hasOwnProperty(key)&& key!='send') notificationItem.body[key] = self[key];
                            }

                            console.log(notificationItem);
                            ns.addToQueue(notificationItem);
                        }
                    }
                }
                return callback(null);
            }
        ],function(err){
            if(err) throw err;
            console.log("Нотификации переданы в очередь на отправку ");
        });
        return 0;
    }
}

exports.nsItem = nsItem;

function NotificationService(ee){

    var queue = [];
    var channel;

    this.startNotificationService = function(io){
        var notificationServiceTransport = io.of('/notifications');
        channel = notificationServiceTransport;
        notificationServiceTransport.on('connection', function (socket) {
            console.log('Соединение установлено -> notifications');
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

    this.startSending = function(){
        while(queue.length > 0){
            var notificationItem = queue[0];
            queue.shift();
            if(!channel.connected[notificationItem.to]) continue;
            channel.connected[notificationItem.to].emit(notificationItem.eventName, notificationItem.body);
        }
        if(queue.length == 0) ee.emit('finish');
    };

    this.addToQueue = function(notification){
        queue.push(notification);
        if (queue.length == 1) {
            ee.emit('start')
        }
        if (queue.length > 30) {
            ee.emit('warning', "Очень много уведомлений: " + queue.length)
        }
    }

    /* this.sendNotifications = function(recievers, notification){
     async.waterfall([
     function (callback) {
     var tasks = [];
     for (var i = 0; i < users.length; i++) {
     tasks.push(taskToGetUserSockets(users[i]));
     }
     async.parallel(tasks, callback);
     },
     function (results, callback) {
     for (var i = 0; i < results.length; i++) {
     if (results[i].length > 0) {
     var notificationItem = {};
     for (var y = 0; y < results[i].length; y++) {
     notificationItem = {
     to: results[i][y],
     eventName: notification.eventName,
     body: notification
     };
     queue.push(notificationItem);
     if (queue.length == 1) {
     ee.emit('start')
     }
     if (queue.length > 30) {
     ee.emit('warning', "Очень много уведомлений: " + queue.length)
     }
     }
     }
     }
     return callback(null);
     }
     ],function(err){
     if(err) throw err;
     console.log("Нотификации переданы в очередь на отправку ");
     });
     return 0;
     }
     */

}

var ns = new NotificationService(notificationServiceEE);

exports.ns = ns;

