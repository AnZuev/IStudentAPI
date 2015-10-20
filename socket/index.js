var authorization = require('./common/authorization');
var mongodbNative = require('../libs/mongodbNative');

mongodbNative.dropCollection("onlineusers", function(err, result){
        if(err) throw err;
        else{
            if(result) {
                console.log("Коллекция onlineusers успешно удалена");
            }else{
                console.log('Коллекция onlineusers не была удалена');
            }
        }
});

module.exports = function(io){
   // io.use(require('./common/authorization'));
   io.use(function(socket, next){
       authorization(socket, function(err, result,callback){
           //if(!result) socket.close();

       })
   });

   io.use(require('./notificationService')(io));
   io.use(require('./dialogs')(io));
   io.use(function(err, socket, next){
       console.log(arguments);
   })


}




