var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();
var sockets = require('./../common/sockets').sockets;
var taskToGetUserSockets = require('./../common/libs').taskToGetUserSockets;
var async = require('async');
var addSocketToDB = require('../common/libs').addSocketToDB;
var log = require('../../libs/log')(module);

notificationServiceEE.on('start', function(){
    log.debug('start emit ns');
    ns.startSending();
});
notificationServiceEE.on('finish', function(){
    log.debug('Отослал все уведомления, новых пока нет');
});

notificationServiceEE.on('warning', function(message){
    log.warn(message);
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
                    tasks.push(taskToGetUserSockets(users[i], "ns"));
                }
                async.parallel(tasks, callback);
            },
            function (results, callback) {
                for (var i = 0; i < results.length; i++) {
                    if(!results[i]) continue;
                    if (results[i].length > 0) {
                        var notificationItem = {};
                        for (var y = 0; y < results[i].length; y++) {
                            notificationItem = {
                                to: results[i][y].id,
                                eventName: self.eventName,
                                body: {

                                }
                            };
                            for(var key in self) {
                                if (!notificationItem.hasOwnProperty(key)&& key!='send' && key!="intersecSortArr"&& key!="diffSortArr" && key!="unique" ) notificationItem.body[key] = self[key];
                            }
                            ns.addToQueue(notificationItem);
                        }
                    }
                }
                return callback(null);
            }
        ],function(err){
            if(err) throw err;
            log.debug("Нотификации переданы в очередь на отправку ");
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
            log.debug('Соединение установлено -> notifications');
            addSocketToDB(socket.id, socket.handshake.headers.user.id, "ns", function(err){
               if(err) throw err;
            });

        });
    };

    this.startSending = function(){
        while(queue.length > 0){
            var notificationItem = queue.shift();

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
    };
}

var ns = new NotificationService(notificationServiceEE);

exports.ns = ns;

