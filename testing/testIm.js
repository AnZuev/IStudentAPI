var User = require('../models/User').User;
var conversation = require('../models/conversation').conversation;
var sockets = require('../socket/common/sockets').sockets;


var convId = "56a3aa906d7a30501f4b0fca";
var onlineUser = require('../socket/common/sockets').onlineUsers;
var userP = "56a379f292f58cbf1a99f29f";
var userA = "56a362eb992f388418145f12";
var userG = "56a37f4ebff41af71b54c752";
var userP2 = "56a39d30fa3a61d11de5d36a";
var userPloskov = "56a39f9e0e5d3cd81d876f98";
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

//im.getMessagesForDialog(dialogId, sender, 10,function(err, messages){
  //  console.log(arguments);
//});

/*
conversation.createPrivateConversation(userA, userG, function(err, conv){
    console.log(arguments);
});

conversation.createGroupConversation("Групповая беседа Ильи, Антона и Георгия", userG, "none", [userA, userG, userP, userPloskov], function(err, conv){
    console.log(arguments);
    var messageItem = {
        attachments:[],
        text:"Первое сообщение"
    };
    conversation.addMessage(conv._id, userP, messageItem, function(err,res){
      console.log(arguments);
    });

});

/*
onlineUser.getSocketsByUserIdAndType("5611659632ede0011018e974", "ns", function(err, result){
    console.log(result);
});


var messageItem = {
    attachments:[],
    text:"Первое сообщение"
};

*/
for(var i = 0; i<-1; i++){
    var messageItem = {
        attachments:[],
        text:"Сообщение" + i
    };
    conversation.addMessage(convId, userP, messageItem, function(err, results){
        console.log(arguments);
    });
}


/*
var invited = [userP2, userPloskov, userP];
conversation.addParticipants(convId, userG, invited, function(err, res){
    console.log(arguments);
});



conversation.removeParticipant(convId,userG, userG, function(err, res){
    console.log(arguments);
});

var time = new Date();
conversation.readMessages(convId, userG, function(err, res){
    console.log(new Date() - time);
    console.log(arguments);
});

/*e
var skipFromEnd = 0;
conversation.getMessages(convId, userA, skipFromEnd, function(err, res){
    console.log(arguments);
});

var title = "Uседа";
conversation.getConvsByTitle(title, userG, function(err, res){
    console.log(arguments);
});

    */
sockets.getSocketsByUserIdAndType(userPloskov, "ns", function(err, res){
    console.log(arguments);
})
