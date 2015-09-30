var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var DbError = require('../../error').DbError;

var dialog = new Schema({
    creator: {
        require: true,
        type: Schema.Types.ObjectId,
        unique: true
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
        if(err) return callback(err);
        else return callback(null, dialog);
    })
}

dialog.statics.addMessage = function(dialogId, sender, message, callback){
    var Dialog = this;
    async.waterfall([
        function(callback){
            Dialog.findById(dialogId, callback)
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
            addMessageToDialog(messageItem, errCounter, callback);


        }
    ],callback)
}

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


exports.dialogs = mongoose.model('dialogs', dialog);




//----------functions

function addMessageToDialog(messageItem, errCounter, callback){
    dialog.save(function(err){
        if(err) {
            if(errCounter > 5) {
                return callback(new DbError(500, "Произошла ошибка при сохранении сообщения"));
            }else{
                errCounter++;
                addMessageToDialog(messageItem, errCounter, callback)
            }

        }
        else{
            return callback(null, messageItem)
        }
    })
}


