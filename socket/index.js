var authorization = require('./common/authorization');
var mongodbNative = require('../libs/mongodbNative');
var console = require('../libs/log')(module);
var sockets = require('./common/sockets').sockets;
var log = require('../libs/log')(module);



mongodbNative.dropCollection("sockets", function(err, result){
        if(err) throw err;
        else{
            if(result) {
                console.info("Коллекция sockets успешно удалена");
            }else{
                console.warn('Коллекция sockets не была удалена');
            }
        }
});

module.exports = function(io){

   io.use(function(socket, next){
       socket.on('disconnect', function () {
           sockets.removeSocketFromList(socket.request.headers.user.id, socket.id, function(err){
               if(err) throw err;
               else{
                   log.debug("Connection lost");
               }

           })
       });

       authorization(socket, function(err){
            if(err) {
                return next(err);
            }
            else return next();
       });




   });

   io.use(require('./notificationService')(io));
   io.use(require('./conversation')(io));
  /* io.on("connection", function(socket){
       socket.on('disconnect', function () {
           sockets.removeSocketFromList(socket.request.headers.user.id, socket.id, function(err, imItem){
               if(err) throw err;
               else{
                   log.debug("Connection lost");
               }

           })
       });
   })*/
   io.use(function(err, socket, next){
       socket.disconnect();
       log.debug("socket disconneted");
   })


}




