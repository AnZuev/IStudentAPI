var authorization = require('./common/authorization');
var mongodbNative = require('../libs/mongodbNative');
var console = require('../libs/log')(module);


mongodbNative.dropCollection("onlineusers", function(err, result){
        if(err) throw err;
        else{
            if(result) {
                console.info("Коллекция onlineusers успешно удалена");
            }else{
                console.warn('Коллекция onlineusers не была удалена');
            }
        }
});

module.exports = function(io){
   io.use(function(socket, next){
       authorization(socket, function(err){
            if(err) return next(err);
            else return next();
       })
   });

   io.use(require('./notificationService')(io));
   io.use(require('./dialogs')(io));
   io.use(function(err, socket, next){
       //console.log(arguments);
   })


}




