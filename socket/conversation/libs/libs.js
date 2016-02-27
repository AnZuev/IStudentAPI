/**
 * Created by anton on 25/01/16.
 */
var User = require('../../../models/User').User;
var UI = require('../../../models/university').university;

var async = require('async');
var util = require('util');

var monthTitles = require('../../../data/month');


/*
 Загрузка информации о личной беседе
 На вход принимает объект беседы и идентификатор пользователя, от имени которого запрашивается беседа
 Отдает объект частной беседы, готовый к отдаче клиенту
 */

function loadPrivateConvInfo(conv, requesterId, callback){
	var tasks = [];
	conv.participants.forEach(function(element){
		if(element.toString() == requesterId){
			var task = function(callback){
				User.getImSettingsByUserAndConvId(requesterId, conv._id, function(err, setItem){
					conv.settings = setItem;
					return callback(null, false);
				});
			};
			tasks.push(task);
		}
		tasks.push(taskToGetUserInfo(element))

	});
	async.parallel(tasks, function(err, results){
		if(err) return callback(err);
		var nParticipants = {};
		results.forEach(function(user){
			if(!user) return;
			nParticipants[user.id] = user;
		});
		var convToReturn = {
			_id: conv._id,
			group:false,
			title: data.username,
			photo: data.photo,
			messages: addDateAndServiceMessages(conv.messages, nParticipants),
			participants: nParticipants,
			settings: conv.settings,
			etc: {
				numberOfParticipants: conv.participants.length
			}
		};
		return callback(null, convToReturn);
	});
}

exports.loadPrivateConvInfo = loadPrivateConvInfo;


/*
	Загрузка информации о групповой беседе
	На вход принимает объект беседы и идентификатор пользователя, от имени которого запрашивается беседа
	Отдает объект беседы, готовый к отдаче клиенту
 */

function loadGroupConvInfo(conv, requesterId, callback){
    var tasks = [];
    conv.participants.forEach(function(element){
        if(element.toString() == requesterId){
            var task = function(callback){
                User.getImSettingsByUserAndConvId(requesterId, conv._id, function(err, setItem){
                    conv.settings = setItem;
                    return callback(null, false);
                });
            };
            tasks.push(task);
        }
	    tasks.push(taskToGetUserInfo(element))

    });
    async.parallel(tasks, function(err, results){
        if(err) return callback(err);
        var nParticipants = {};
        results.forEach(function(user){
	        if(!user) return;
            nParticipants[user.id] = user;
        });
	    var convToReturn = {
		    _id: conv._id,
		    group:true,
		    title: conv.group.title,
		    photo: conv.group.photo,
		    owner: conv.group.owner,
		    messages: addDateAndServiceMessages(conv.messages, nParticipants),
		    participants: nParticipants,
		    settings: conv.settings,
		    etc: {
			    numberOfParticipants: conv.participants.length
		    }
	    };
	    return callback(null, convToReturn);
    })
}

exports.loadGroupConvInfo = loadGroupConvInfo;

/*
 Задание на получение информации об участнике диалога
 на вход принимает userId
 отдает user'a с заполненными полями
 */
function taskToGetUserInfo(userId){
	return function(callback){
		async.waterfall([
			function(callback){
				User.getUserById(userId, function(err, user){
					if(err) return callback(err);
					else{
						var data = {
							id: user._id,
							photo: user.pubInform.photo,
							faculty: user.pubInform.faculty,
							university: user.pubInform.university,
							username: user.pubInform.name + " " + user.pubInform.surname,
							year: user.pubInform.year
						};
						return callback(null, data);
					}
				});
			},
			function(user, callback){
				UI.makeContact(user, callback);
			}
		], function(err, result){
			if(err) return callback(err);
			else{
				return callback(null, result);
			}
		})

	}
}


/*
	Добавление сообщений типа date в массив сообщений
	На вход принимает messages
	Возвращает messages со вставленными сообщениями даты
 */
exports.addDateAndServiceMessages = addDateAndServiceMessages;
function addDateAndServiceMessages(messages, participants, username){
	var messageTypes = require('./serviceMessagesType');
	var resultMessages = [];

	if(messages.length == 0) return;
	var prevDate = {
		month: messages[0].date.getMonth(),
		day: messages[0].date.getDate()
	};
	if(participants){
		messages.forEach(function(element){
			var serviceMessage = {};
			if(element.etc.mType == "service"){
				if(messageTypes[element.etc.action]){

					if(participants[element.etc.actionMember]){
						serviceMessage.text = util.format(messageTypes[element.etc.action], participants[element.etc.actionMember].username);
					}
					serviceMessage.date = element.date;
					serviceMessage.service = true;
					element = serviceMessage;
				}
			}
			if((element.date.getDate() > prevDate.day) && (element.date.getMonth >= prevDate.month)){
				var dateMessage = {
					type: "date",
					text: util.format("%d %s", element.getDate(), monthTitles[element.getMonth()])
				};
				prevDate.day = element.date.getDate();
				prevDate.month = element.date.getMonth();
				resultMessages.push(dateMessage);
			}
			resultMessages.push(element);
		});
	}else{
		messages.forEach(function(element, index){
			if((element.date.getDate() > prevDate.day) && (element.date.getMonth >= prevDate.month)){
				var dateMessage = {
					type: "date",
					text: util.format("%d %s", element.getDate(), monthTitles[element.getMonth()])
				};
				prevDate.day = element.date.getDate();
				prevDate.month = element.date.getMonth();
				resultMessages.push(dateMessage);
			}
			resultMessages.push(element);
		});
	}
	return resultMessages;
};





