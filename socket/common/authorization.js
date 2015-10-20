var async = require('async');
var cookie = require('cookie');
var config = require('../../config');
var cookieParser = require('cookie-parser');
var sessionStore = require('../../libs/sessionsStore');
var User = require('../../models/User').User;
var HttpError = require('../../error').HttpError;
var listOfOnlineUsers = require('./listOfOnlineUsers').onlineUsers;






module.exports = function(socket, callback) {
        var handshakeData = socket.request.headers;
        var socketId;
        async.waterfall([
            function(callback){
                handshakeData.cookies = cookie.parse((handshakeData.cookie || ""));
                var sidCookie = handshakeData.cookies[config.get("session:key")];
                socketId = handshakeData.cookies["io"];
                loadSession(cookieParser.signedCookie(sidCookie, config.get('session:secret')), callback)
            },
            function(session, callback){
                if(!session){
                    callback(new HttpError(401, 'Нет сессии'))
                }else{
                    handshakeData.session = session;
                    loadUser(session, callback);
                }
            },
            function(user, callback){
                if(!user){
                     callback(new HttpError(403, "Для подключения по ws сессия должна быть не анонимной"))
                }else{
                    handshakeData.user =user;
                    listOfOnlineUsers.checkIfUserOnline(user.id, function(err, socketId){
                        if(socketId){
                            callback(null, {userId: user.id, in:true});
                        }else{
                            callback(null, {userId: user.id, in:false});
                        }
                    });
                }

            },
            function(userItem, callback){
                if(userItem.in) {
                    listOfOnlineUsers.addToList(userItem.userId, socketId, callback);
                }else{
                    listOfOnlineUsers.addNewUser(userItem.userId, socketId, callback);
                }
            }
        ],function(err){
            console.error(err);
            if(err) {
                return callback(null, false);
            }
            else{
                return callback(null,true);
            }
        })
}

function loadUser(session, callback){
    if(!session.user){
        console.warn('Попытка найти юзера для анонимной сессии');
        callback(null, null);
    }else{
        User.findById(session.user, function(err, user){
            if(err) return callback(err);
            if(user) {
                var student =  {
                    username: user.personal_information.lastName + " " + user.personal_information.firstName,
                    id: user._id,
                    photo: user.personal_information.photoUrl
                };
                return callback(null, student)
            }else{
                return callback(null, null);
            }
        })
    }
}

function loadSession(sid, callback){
    sessionStore.load(sid, function(err, session){
        if(arguments.length == 0){
            return callback(null, null)
        }else{
            return callback(null, session);
        }
    })
}

