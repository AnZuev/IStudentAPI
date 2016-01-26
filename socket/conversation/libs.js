/**
 * Created by anton on 25/01/16.
 */
var User = require('../../models/User').User;
var universityInterface = require('../../data/index').universityInfoLoader;

var async = require('async');

function loadPrivateConvInfo(conv, requesterId, callback){
    conv.participants.forEach(function(element, index){
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
                conv.participants = nParticipants;
                conv.title = data.username;
                conv.photo = data.photo;
                return callback(null,conv);
            }
        })
    })


}

exports.loadPrivateConvInfo = loadPrivateConvInfo;

function loadGroupConvInfo(conv, requesterId, callback){
    var tasks = [];
    conv.participants.forEach(function(element){
        if(element == requesterId) return;
        tasks.push(taskToGetUserInfo(element))
    });
    async.parallel(tasks, function(err, results){
        if(err) return callback(err);
        var nParticipants = {};

        results.forEach(function(user, index){
            nParticipants[user.id] = user;
        });
        conv.participants = nParticipants;

        return callback(null,conv);
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