var User = require('../models/User').User;
var im = require('../models/dialogsStorage').dialogs;

var dialogId = "56215c0284e2731dc7c849b7";
var sender = "5611659632ede0011018e974";
var message = "Cообщение юзера ";
/*
for(var i = 0; i<60; i++){
    im.addMessage(dialogId, sender, message + i, function(err, message){
        console.log(arguments);
    });
}
 */
/*
im.getDialogById(dialogId, sender, function(err, imItem){
    console.log(imItem);
});
*/

im.getMessagesForDialog(dialogId, sender, 10,function(err, messages){
    console.log(arguments);
});
