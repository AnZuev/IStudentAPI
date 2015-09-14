var log = require('../../libs/log')(module);
var config = require('../../config');
var EventEmitter = require('events').EventEmitter;
var notificationServiceEE = new EventEmitter();


module.exports = function(io){
    var ns = require('./nsInterface').ns;
    ns.startNotificationService(io);
}











