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
        title: title
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
            dialog.save(function(err){
                if(err) return callback(new DbError());
                else{
                    return callback(null, messageItem)
                }
            })

        }
    ],callback)
}



exports.dialogs = mongoose.model('dialogs', dialogs);
