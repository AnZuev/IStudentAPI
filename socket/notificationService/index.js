var log = require('../../libs/log')(module);
var config = require('../../config');


module.exports = function(io){
    var ns = require('./nsInterface').ns;
    ns.startNotificationService(io);
}











