var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var dbError = require('../error/index').dbError;
var conversationError = require('../error/index').conversationError;

var User = require('../models/User').User;

require('../libs/additionalFunctions/extensionsForBasicTypes');


var Message = new Schema({
    text: {
        type:String,
	    require: false
    },
    sender: {
        type:Schema.Types.ObjectId,
	    require: false
    },
    date:{
        type: Date,
        default: Date.now()
    },
    unread:[Schema.Types.ObjectId],
    etc: {
	    mType: String,
	    action: String,
	    actionMember: Schema.Types.ObjectId
    },
    attachments: {
        type: {
            type: String,
	        require: true
        },
        name: {
            type: String,
	        require: true
        },
        content: {}
    }

}, {_id: 0});

var conversation = new Schema({
    participants:[Schema.Types.ObjectId],
    group:{
        title: String,
        photo: String,
        owner: Schema.Types.ObjectId
    },
    messages:[Message],
    updated: {
	    type:Date,
	    default:Date.now()
    }
});



/*
* Функции для поиска беседы по разным параметрам.
*/



/*
* Создание личного диалога между 2 людьми
*/
conversation.statics.createPrivateConversation = function(userId1, userId2, callback){
    var conversation = this;
    async.waterfall([
        function(callback){
            conversation.getPrivateConvByParticipants(userId1, userId2, function(err, conv){
	            if(err){
		            if(err instanceof dbError && err.code == 404){
			            return callback(null, null);
		            }
	            }else{
		            return callback(null, conv);
	            }
            })
        },
        function(conv, callback) {
            if (conv) return callback(null,conv);
            else {

	            var users = [];
	            users.push(userId1);
	            users.push(userId2);
                var newConv = new conversation({
                    participants: users
                });
                newConv.save(function (err, conv) {
                    if (err) return callback(new dbError(err, null, null));
                    else {
                        return callback(null, conv);
                    }
                })
            }
        }
    ], callback);

};

/*
 * Создание группового диалога между 3 и более людей
 */
conversation.statics.createGroupConversation = function(title, owner, photo, participants, callback){
    var conversation = this;
	var messageItem = {
		etc:{
			mType: "service",
			action: "create",
			actionMember: owner
		}
	};

    var newConv = new conversation({
        participants:participants,
        group:{
            title: title,
            owner: owner,
            photo: photo
        },
	    messages:[messageItem]
    });
    newConv.save(function(err, conv){
        if(err) throw err;
        if(err) return callback(new dbError(err,null, null));
        else {
            return callback(null, conv);
        }
    });
};


conversation.statics.addMessage = function(convId, userId, rawMessage, callback){
    var conversation = this;
    async.waterfall([
        function(callback){
            conversation.findOne({_id:convId, participants: userId}, callback);
        },
        function(conv, callback){
            if(!conv) return callback(new dbError(null, 400, "Беседа не найдена"));
            else{
                var participants = [];
                conv.participants.forEach(function(element, index, array){
                    participants.push(element);
                });
                participants.splice(conv.participants.indexOf(userId), 1);
                var messageItem = {
                    sender:userId,
                    text:rawMessage.text,
                    unread: participants,
                    attachments: rawMessage.attachments, //TODO сделать проверку для прикрепленных документов дабы избежать возможности атак
	                date: Date.now()
                };
                conv.updated = Date.now();
                conv.messages.push(messageItem);
                var errCounter = 0;
                addMessageToDialog(conv, messageItem, errCounter,function(err){
	                if(err) return callback(err);
	                else{ return callback(null, messageItem, conv.messages)}
                });

	            if(conv.participants.length == 2){
		            var tasks = [];
		            tasks.push(taskToAddContact(conv.participants[0], conv.participants[1]));
		            tasks.push(taskToAddContact(conv.participants[1], conv.participants[0]));
					async.parallel(tasks, function(){})
	            }
            }
        }
    ],callback)
};

conversation.statics.removeParticipant = function(convId, userId, removedUser, callback){

    var conversation = this;


    async.waterfall([
        function(callback){
            conversation.findOne(
                {
                    _id:convId
                },
                callback);
        },
        function(conv, callback){
            if(conv){
                if(userId == conv.group.owner.toString()){
                    if(userId == removedUser){
	                    var newOwner;
	                    for(var i = 0; i < conv.participants.length; i++){
		                    if(conv.participants[i] != removedUser) {
			                    newOwner = conv.participants[i];
			                    break;
		                    }
	                    }
	                    conv.update({$pull:{participants:removedUser}, owner: newOwner}, function(err, res){
		                    if(err) callback(new dbError(err, null, null));
		                    else{
			                    if(res.nModified > 0){
				                    return callback(null, true);
			                    }else{
				                    return callback(null, false);
			                    }
		                    }
	                    });
                    }else{
                        conv.update(
	                        {
		                        $pull:{participants:removedUser}
	                        }, function(err, res){
                            if(err) callback(new dbError(err, null, null));
                            else{
                                if(res.nModified > 0){
                                    return callback(null, true);
                                }else{
                                    return callback(null, false);
                                }
                            }
                        });
                    }
                }else if(userId == removedUser){
                    conv.update({$pull:{participants:removedUser}}, function(err, res){
                        if(err) callback(new dbError(err, null, null));
                        else{
                            if(res.nModified > 0){
                                return callback(null, true);
                            }else{
                                return callback(null, false);
                            }
                        }
                    });
                }else{
                    callback(new conversationError(403, "Действие запрещено"));
                }
            }else{
                return callback(new conversationError(404, "Не найден диалог"));
            }
        }
    ],callback);

};

conversation.statics.addParticipants = function(convId, userId, invited, callback){
    this.findOneAndUpdate(
        {
            _id:convId,
	        participants: userId
        },
        {
            $addToSet: {
                participants: { $each: invited }
            }
        }, function(err, conv){
            if(err) return callback(err);
            else{
                if(!conv){
                    callback(null, false);
                }else{
                    callback(null, true);
                }
            }
        })
};

conversation.statics.readMessages = function(convId, userId, callback){
    var conversation = this;
    async.waterfall([
        function(callback){
            conversation.findOne({
                _id: convId,
                participants:userId,
                "messages.unread": userId
            }, callback);
        },
        function(conv, callback){
            if(!conv) return callback(null, false);
	        try{
		        conv.messages.forEach(function(element){
			        element.unread.splice(element.unread.indexOf(userId), 1);   /* TODO подумать насчет того, что эта операция может блокировать поток выполенения ноды*/
		        });
		        conv.save(function(err){
			        if(err){
				        return callback(new dbError(err, null, null));
			        }else{
				        return callback(null, true, conv);
			        }
		        })
	        }catch(e){
		        return callback(null, false);
	        }
        }
    ], callback);
};

conversation.statics.getMessages = function(convId, userId, skipFromEnd, callback){
    if(skipFromEnd < 20){
        skipFromEnd = 20;
    }
    this.findOne(
        {
            _id:convId,
            participants:userId
        },
        {
            messages:{
                $slice:[-1*skipFromEnd, 20 ]
            }
        },
        function(err, conv){
            return callback(err, {convId: conv._id, messages:conv.messages});
        }
    )


};

conversation.statics.getConvsByTitle = function(title, userId, callback){

    this.aggregate([
        {
            $match:
            {
                "group.title": {$regex: title},
	            "participants": mongoose.Types.ObjectId(userId)
            }
        },
	    {
		    $project:
		    {
			    title: "$group.title",
			    photo: "$group.photo",
			    type: {$concat:["group"]},
			    lastMessage: {$slice: ["$messages", -1]}
		    }
	    },
	    {
		    $unwind: "$lastMessage"
	    },
	    {
		    $project:
		    {
			    title: "$title",
			    photo: "$photo",
			    type: "$type",
			    lastMessage: "$lastMessage.text"
		    }
	    },
	    { $limit : 15 },
	    {
		    $sort:{updated:1}
	    }
    ], function(err, convs){
	    if(err) throw err;
        if(convs.length == 0){
            return callback(new dbError(null, 204, null));
        }else{
            return callback(null, convs);
        }
    })
};

conversation.statics.getConvById = function(convId, userId,callback){
    this.findOne(
        {
            _id:convId,
            participants:userId
        },
        {
            messages:{
                $slice:-20
            }
        },
        function(err, conv){
            if(err) return callback(new dbError(err));
            else{
                var data;
                if(conv){
                    data = {
                        _id: conv._id,
                        messages:conv.messages,
                        participants: conv.participants,
                        photo: conv.group.photo,
                        title:conv.group.title
                    };
                    return callback(null, data);
                }else{
                    return callback(new dbError(null, 404, "No conversation found"))
                }
            }

        }
    )
};

conversation.statics.getPrivateConvByParticipants = function(userId1, userId2, callback){



	this.findOne(
        {
            participants:{$all:[userId1, userId2], $size: 2}
        },
        {
            messages:{
                $slice:-20
            }
        },
        function(err, conv){

            if(err) return callback(new dbError(err));
            else{
                var data;
                if(conv){
                    data = {
                        _id: conv._id,
                        messages:conv.messages,
                        participants: conv.participants
                    };
                    return callback(null, data);
                }else{
                    return callback(new dbError(null, 404, "No conversation found"))
                }
            }

        }
    );

};


conversation.statics.getLastConversations = function(userId, number, callback){
	this.find(
		{
			"participants":userId
		},
		{
			messages:{
				$slice:-20
			},
			__v: 0,
			updated:0
		},
		{
			$sort: {updated:1},
			$limit: number
		},
		function(err, convs){
			if(err) return callback(new dbError(err, 500));
			else{
				if(convs) return callback(null, convs);
				else{
					return callback(new dbError(null, 404, null));
				}
			}
		}
	)
};

conversation.statics.getUnreadMessagesForUser = function(userId, callback){
	this.count({
			"participants":userId,
			"messages.unread": userId
		},
		function(err, count){
			if(err) return callback(null, 0);
			else{
				return callback(null, count);
			}
		}
	)
};
/*

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
*/



exports.conversation = mongoose.model('conversation', conversation);


exports.message = mongoose.model('message', Message);





//----------functions

function addMessageToDialog(conv, messageItem, errCounter, callback){
    conv.save(function(err, conv){
        if(err) {
            if(errCounter > 5) {
                return callback(new dbError(null, 500, "Произошла ошибка при добавлении сообщения " + errCounter + " раз"));
            }else{
                errCounter++;
                addMessageToDialog(conv,messageItem, errCounter, callback)
            }
        }
        else{
            return callback(null, conv)
        }
    })
}

function taskToAddContact(userId, contact){
    return function(callback){
        User.addContacts(userId, contact, function(){
            return callback(null);
        })
    }
}

