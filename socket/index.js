var authorization = require('./common/authorization');


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




