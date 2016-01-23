var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var DbError = require('../error/index').DbError;

var dialog = new Schema({
    creator: {
        require: true,
        type: Schema.Types.ObjectId
    },
    enable:{
        type: Boolean
    },
    title:{
        require: true,
        type: String
    },
    participants:[Schema.Types.ObjectId],
    messages:[
        {
            message:{
                type: String,
                require:true
            },
            sender:{
                type: Schema.Types.ObjectId
            },
            created: {
                type: Date,
                default:Date.now()
            }
        }
    ],
    created:{
        type: Date,
        default: Date.now()
    }
});

dialog.statics.createDialog = function(creator, participants, title, callback){
    var Dialog = this;
    var newDialog = new Dialog({
        creator:creator,
        participants:participants,
        title: title,
        enable:true
    });
    newDialog.save(function(err, dialog){
        if(err) return callback(new DbError(5300, "При создании диалога произошла ошибка",  err));

        else {
            var imInstance = {
                title: dialog.title,
                participants: dialog.participants,
                id: dialog._id
            };
            return callback(null, imInstance);
        }
    })
};

dialog.statics.addMessage = function(dialogId, sender, message, callback){
    var Dialog = this;
    async.waterfall([
        function(callback){
            Dialog.findById(dialogId, callback);
        },
        function(dialog, callback){
            if(!dialog || !dialog.enable) return callback(new DbError(404, "Диалог не найден"));
            else{
                if(dialog.participants.indexOf(sender) < 0){
                    return callback(new DbError(403, "Доступ запрещен"));
                }else{
                    return callback(null, dialog)
                }

            }
        },
        function(dialog, callback){
            var messageItem = {
                message: message,
                sender:sender
            };
            dialog.messages.push(messageItem);
            var errCounter = 0;
            addMessageToDialog(dialog,messageItem, errCounter, callback);


        }
    ],callback)
};

dialog.statics.addParticipants = function(dialogId, participantsArray, callback){
    this.find({_id:dialogId}, function(err, dialog){
        if(err) throw err;
        else{
            if(dialog){
                for(var i = 0; i< participantsArray.length; i++){
                    if(dialog.indexof(participantsArray[i])<0) {
                        dialog.participants.push(participantsArray[i]);
                    }
                }
                dialog.save(function(err, createdDialog){
                    if(err) return callback(err);
                    else{
                        return callback(createdDialog);
                    }
                })
            }
        }
    })
}

dialog.statics.getDialogsTitleByUser = function(userId, callback){
    this.find({enabled: true, participants:userId}, {enable:0, _id:1, title:1, messages: { "$slice": -1 }, limit:10}, function(err, dialogs){
        if(err) throw err;
        else{
            return callback(null, dialogs);
        }
    })
};
dialog.statics.getDialogById = function(imId, userId, callback){
    this.find({enable: true, _id:imId, participants:userId}, {_id:1, title:1, messages: { "$slice": -10 }, participants: 1}, function(err, imItem){
        if(err) throw err;
        else{
            if(imItem.length > 0) return callback(null, imItem[0]);
            else{
                return callback(null, null);
            }

        }
    })
};
dialog.statics.getMessagesForDialog = function(imId, userId, skip, callback){
    this.find({enable: true, _id:imId, participants:userId}, {_id:1, messages: { "$slice": [-skip,10]}}, function(err, imItem){
        if(err) throw err;
        else{
            if(imItem.length > 0) return callback(null, imItem[0]);
            else{
                return callback(null, null);
            }
        }
    })
};

exports.dialogs = mongoose.model('dialogs', dialog);




//----------functions

function addMessageToDialog(dialog,messageItem, errCounter, callback){
    dialog.save(function(err){
        if(err) {
            if(errCounter > 5) {
                return callback(new DbError(500, "Произошла ошибка при сохранении сообщения"));
            }else{
                errCounter++;
                addMessageToDialog(dialog,messageItem, errCounter, callback)
            }

        }
        else{
            return callback(null, messageItem)
        }
    })
}


