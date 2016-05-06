var async = require('async');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var sessionStore = require('../../libs/sessionsStore');

var config = require('../../config');
var User = require('../../models/User').User;
var HttpError = require('../../error').HttpError;
var sockets = require('./sockets').sockets;
var universityFile = require('../../data/university');
var log = require('../../libs/log')(module);
var UI = require('../../models/university').university;








module.exports = function(socket, callback) {
        var handshakeData = socket.request.headers;
        async.waterfall([
            function(callback){
                handshakeData.cookies = cookie.parse((handshakeData.cookie || ""));
	            var sidCookie = handshakeData.cookies[config.get("session:key")];
	            if(sidCookie) loadSession(cookieParser.signedCookie(sidCookie, config.get('session:secret')), callback)
				else callback(null, null);
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
                    handshakeData.user = user;
                    callback(null);
                }

            }
        ],function(err){
            if(err) {
                return callback(err);
            }
            else{
                return callback(null);
            }
        })
};

function loadUser(session, callback){
    if(!session.user){
        log.warn('Попытка найти юзера для анонимной сессии');
        callback(null, null);
    }else{
        User.findById(session.user, function(err, user){
            if(err) return callback(err);
            if(user) {
	            async.parallel([
		            function(callback){
			            UI.getFacultyName(user.pubInform.university, user.pubInform.faculty, callback);
		            },
		            function(callback){
			            UI.getUniversityName(user.pubInform.university, callback);
		            }
	            ], function(err, results){
		            if(err || results.length != 2) return callback(new Error("Ошибка при попытке получить информацию по универу и факультету"));
		            var student = {
			            name: user.pubInform.name,
			            surname: user.pubInform.surname,
			            photo:user.pubInform.photo,
			            year: user.pubInform.year,
			            faculty: results[0].title,
			            university: results[1].title,
			            group: user.pubInform.group,
			            id: user._id,
			            settings: user.settings
		            };

		            return callback(null, student)
	            });

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

