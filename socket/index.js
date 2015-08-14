var authorization = require('./authorization');

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
        // make sure the handshake data looks good as before
        // if error do this:
        // next(new Error('not authorized');
        // else just call next
    });
    require('./notificationService')(io);
    require('./dialogs')(io);
}







