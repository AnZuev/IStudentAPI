var async = require('async');
var cookie = require('cookie');
var config = require('../../config');
var cookieParser = require('cookie-parser');
var sessionStore = require('../../libs/sessionsStore');
var User = require('../../models/User').User;
var HttpError = require('../.').HttpError;
var listOfOnlineUsers = require('./listOfOnlineUsers').onlineUsers;






module.exports = function(socket, callback) {
        var handshakeData = socket.request.headers;
        async.waterfall([
            function(callback){
                handshakeData.cookies = cookie.parse((handshakeData.cookie || ""));
                var sidCookie = handshakeData.cookies[config.get("session:key")];
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
                    return callback(new HttpError(403, "Для подключения по ws сессия должна быть не анонимной"))
                }else{
                    handshakeData.user =user;
                    listOfOnlineUsers.checkIfUserOnline(user.id, function(err, socketId){
                        if(err) return callback(err);
                        if(socketId){
                            console.warn('Запись о том, что юзер онлайн, не была удалена при разрыве соединения');
                            return callback(null);
                        }else{
                            listOfOnlineUsers.addToList(user.id, socket.id, function(err, user){
                                if(err) return callback(err);
                                else{
                                    console.log('добавил юзера онлайн' + user)
                                    return callback(null)
                                }
                            })
                        }
                    });
                }

            }
        ],function(err){
            if(err) {
                callback(null,false);
            }
            else{
                return callback(null,true);
            }
        })
}

function loadUser(session, callback){
    if(!session.user){
        console.warn('Попытка найти юзера для анонимной сессии');
        return callback(null, null);
    }else{

        User.findById(session.user, function(err, user){
            var student =  {
                username: user.personal_information.lastName + " " + user.personal_information.firstName,
                id: user._id
            }
            if(err) return callback(err);
            if(user) {
                return callback(null, student)
            }else{
                return callback(null, null);
            }
        })

        var student =  {
            username: "Зуев Антон",
            id: "55c05ed72631f5d19fc0b0df"
        }
        return callback(null, student)


    }
}

function loadSession(sid, callback){
    sessionStore.load(sid, function(err, session){
        if(arguments.length == 0){
            return callback(null, null)
        }else{
            //console.log(session);
            return callback(null, session);
        }
    })
}

