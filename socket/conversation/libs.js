/**
 * Created by anton on 25/01/16.
 */
var User = require('../../models/User').User;
var UI = require('../../models/university').university;

var async = require('async');
var util = require('util');

var monthTitles = require('../../data/month');


function loadPrivateConvInfo(conv, requesterId, callback){

    async.waterfall([
        function(callback){
            User.getImSettingsByUserAndConvId(requesterId, conv._id, function(err, setItem){
                conv.settings = setItem;
                return callback(null);
            });
        },
        function(callback){
	        conv.participants.forEach(function(element){
                if(element == requesterId) return;
                User.getUserById(element, function(err, user){
                    if(err) return callback(err);
                    else{
                        var data = {
                            id: user._id,
                            photo: user.pubInform.photo,
                            about: universityInterface.getFacultyName(user.pubInform.university, user.pubInform.faculty) + ", " + user.pubInform.year + " курс, группа " + user.pubInform.group,
                            university: universityInterface.getUniversityName(user.pubInform.university),
                            username: user.pubInform.name + " " + user.pubInform.surname
                        };
                        var nParticipants = {};
                        nParticipants[user._id] = data;
	                    var convToReturn = {
		                    _id: conv._id,
		                    group:false,
		                    title: data.username,
		                    photo: data.photo,
		                    messages: conv.messages,
		                    participants: nParticipants,
		                    settings: conv.settings
	                    };
                        return callback(null, convToReturn);
                    }
                })
            })
        }
    ], function(err, conv){
        if(err) return callback(err);
        return callback(null, conv);
    })





}

exports.loadPrivateConvInfo = loadPrivateConvInfo;

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
        }else{
            tasks.push(taskToGetUserInfo(element))
        }
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
		    messages: conv.messages,
		    participants: nParticipants,
		    settings: conv.settings
	    };
	    return callback(null, convToReturn);
    })
}

exports.loadGroupConvInfo = loadGroupConvInfo;

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
							username: user.pubInform.name + " " + user.pubInform.surname
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

exports.addDateMessages = function(messages){
	var prevDate = {
		month: messages[0].date.getMonth(),
		day: messages[0].date.getDate()
	};

	var resultMessages = [];
	messages.forEach(function(element, index){
		if(index == 0) return;
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
	return resultMessages;
};

