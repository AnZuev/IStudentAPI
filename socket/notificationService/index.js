var log = require('../../libs/log')(module);
var config = require('../../config');
var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();


module.exports = function(io){
    var ns = require('./nsInterFace').ns;
    ns.startNotificationService(io);

    notificationServiceEE.on('start', function(){
        ns.sendingNotification();
    });
    notificationServiceEE.on('finish', function(){
        console.log('Отослал все уведомления, новых пока нет');
    });

    notificationServiceEE.on('warning', function(message){
        console.warn(message);
    })
}











