module.exports = function(io){
    var notificationServiceTransport = io.of('/dialogs');
    notificationServiceTransport.on('connection', function (socket) {
        console.log('Соединение установлено -> dialogs');

        socket.emit('dialog', {message: "Диалоги"});
        socket.on('disconnect', function () {
            console.log("Connection lost -> dialogs");
        });
    });

}