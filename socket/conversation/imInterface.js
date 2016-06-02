var EventEmitter = require('events').EventEmitter;
var imServiceEE = new EventEmitter();
var sockets = require('../common/sockets').sockets;
var async = require('async');
var dialogStorage = require('./../../models/conversation/index').conversation;
var User = require('../../models/User/index').User;
var dbError = require('../../error').dbError;
var addSocketToDB = require('../common/libs').addSocketToDB;
var log = require('../../libs/log')(module);

var taskToGetUserSockets = require('./../common/libs').taskToGetUserSockets;






imServiceEE.on('warning', function(message){
   log.warn(message);
});


function imService(ee){

    var channel;

    this.start = function(io){
        var dialogServiceTransport = io.of('/im');
        channel = dialogServiceTransport;
        dialogServiceTransport.on('connection', function (socket) {
            log.debug('Начинаю установку соединения ws::im');

            socket.on('createPrivateConversation', function(data, cb){
                require('./handlers/createPrivateConversation')(socket, data, cb);
            });

            socket.on('createGroupConversation', function(data, cb){
                require('./handlers/createGroupConversation')(socket, data, cb);
            });

            socket.on('sendMessage', function(data, cb){
                require('./handlers/sendMessageToOneConversation')(socket, data, cb);
            });

            socket.on('getMessages', function(data, cb){
                require('./handlers/getMessages')(socket, data, cb);
            });

            socket.on('loadConv', function(data, cb){
                require('./handlers/loadConv')(socket, data, cb);
            });

            socket.on('getConvsByTitle', function(data, cb){
                require('./handlers/getConvByTitle')(socket, data, cb);
            });

            socket.on('startTyping', function(data){
	            var eventType = 'startTyping';
	            require('./handlers/sendEvent')(socket, data, eventType);
            });

            socket.on('stopTyping', function(data){
	            var eventType = 'stopTyping';
	            require('./handlers/sendEvent')(socket, data, eventType);
            });

	        socket.on('addParticipants', function(data, cb){
		        require('./handlers/modifyParticipants').addParticipants(socket, data, cb);
	        });

	        socket.on('removeParticipant', function(data, cb){
		        require('./handlers/modifyParticipants').removeParticipants(socket, data, cb);
	        });

	        socket.on('exitFromConv', function(data, cb){
		        require('./handlers/modifyParticipants').exitFromConv(socket, data, cb);
	        });

	        socket.on('sendMessageToManyConversations', function(data, cb){
		        require('./handlers/sendMessageToManyConversations')(socket, data, cb);
	        });

	        socket.on('readMessages', function(data, cb){
		        require('./handlers/readMessages')(socket, data, cb);
	        });

            socket.on('settings', function(data, cb){
                require('./handlers/settings').setAllSettings(socket, data, cb);
            });
			socket.on("setNotification", function(data, cb){
				require('./handlers/settings').setNotification(socket, data, cb);
			});
	        socket.on('isOnline', function(data, cb){
		       require('./handlers/isOnlineHandler')(socket, data, cb);
	        });
	        socket.on('getContacts', function(data, cb){
		        require('./handlers/getContacts')(socket, data, cb);
	        });
	        /*socket.on('findContacts', function(data, cb){
		        require('./handlers/findContacts')(socket, data, cb);
	        });
			*/
            socket.on('connection:accepted', function(){
                log.debug('Событие connection:accepted сработало');
                addSocketToDB(socket.id, socket.handshake.headers.user.id, "im", function(err){
                    if(err) throw err;
                    log.debug('Соединение установлено -> im. Socket успешно добавлен');
                });
            });
        });


    };


    function mmws(convId, sender, message, eventName, options){
        this.title = sender.name + " " + sender.surname;
        this.photo = sender.photo;
        this.text = message.text;
        this.convId = convId;
        this.options = options;
        this.eventName = eventName;
        var self = this;

        this.sendToGroup = function(recievers){
            async.waterfall([
                function (callback) {
                    var tasks = [];
                    for (var i = 0; i < recievers.length; i++) {
                        tasks.push(taskToGetUserSockets(recievers[i], "im"));
                    }
                    async.parallel(tasks, callback);
                },
                function (results, callback) {
                    for (var i = 0; i < results.length; i++) {
                        if(!results[i]) continue;
                        if (results[i].length > 0) {
                            var mmwsItem = {};
                            for (var y = 0; y < results[i].length; y++) {
                                mmwsItem = {
                                    eventName: self.eventName,
                                    convId: self.convId,
                                    title: self.title,
                                    photo: self.photo,
                                    text: self.text,
                                    options: options,
                                    senderId: sender.id
                                };
                                if(channel.connected[results[i][y].id]){
	                                channel.connected[results[i][y].id].emit(mmwsItem.eventName, mmwsItem);
                                }else{
	                                log.debug("Перехвачена попытка отправить что-то несуществующему сокету")
                                }
                            }
                        }
                    }
                    return callback(null);
                }
            ],function(err){
                if(err) throw err;
            });
            return 0;
        };
	    this.sendEventToGroup = function(recievers){
		    async.waterfall([
			    function (callback) {
				    var tasks = [];
				    for (var i = 0; i < recievers.length; i++) {
					    tasks.push(taskToGetUserSockets(recievers[i], "im"));
				    }
				    async.parallel(tasks, callback);
			    },
			    function (results, callback) {
				    for (var i = 0; i < results.length; i++) {
					    if(!results[i]) continue;
					    if (results[i].length > 0) {
						    var mmwsItem = {};
						    for (var y = 0; y < results[i].length; y++) {
							    mmwsItem = {
								    convId: self.convId,
								    sender: sender,
								    eventName: self.eventName
							    };
							    if (channel.connected[results[i][y].id]) {
								    channel.connected[results[i][y].id].emit(mmwsItem.eventName, mmwsItem);
							    } else {
								    log.debug("Перехвачена попытка отправить что-то несуществующему сокету");
							    }
						    }
					    }
				    }
				    return callback(null);
			    }
		    ],function(err){
			    if(err) throw err;
		    });
		    return 0;
	    }
    }
    exports.mmws = mmws;

}
var im = new imService(imServiceEE);

exports.im = im;



function createTaskToAddContacts (userTo, participants){
    var contacts = participants.slice();
    return function(callback){
        console.log("_------" + contacts);
        User.addContacts(userTo, contacts, callback);
    }
}

