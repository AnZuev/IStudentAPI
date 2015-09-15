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
    io.use(function(socket, next) {
        authorization(socket, function(err, result){
            if(!result){
                console.warn('Произошла ошибка при установке соединения ws');
                next(new Error('Отказано в доступе'));
            }else{
                console.log("Авторизация прошла без ошибок:)");
                next();
            }
        });

    });
    require('./notificationService')(io);
    require('./dialogs')(io);
}




