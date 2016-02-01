/**
 * Created by anton on 25/01/16.
 */
var User = require('../../models/User').User;
var universityInterface = require('../../data/index').universityInfoLoader;

var async = require('async');

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
        results.forEach(function(user, index){
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
		User.getUserById(userId, function(err, user){
			if(err) return callback(err);
			else{
				var data = {
					id: user._id,
					photo: user.pubInform.photo,
					about: universityInterface.getFacultyName(user.pubInform.university, user.pubInform.faculty) + ", " + user.pubInform.year + " курс, группа " + user.pubInform.group,
					university: universityInterface.getUniversityName(user.pubInform.university),
					username: user.pubInform.name + " " + user.pubInform.surname
				};

				return callback(null, data);
			}
		})
	}
}