/**
 * Created by anton on 05/12/15.
 */
var async = require('async');
var log = require('../../libs/log')(module);
var util = require('util');

var sockets = require('./sockets').sockets;

function taskToGetUserSockets(userId, socketType){
    return function(callback){
        sockets.getSocketsByUserIdAndType(userId, socketType, function(err, result){
            if(err) return callback(null, []);
            if(result){
                return callback(null, result);
            }else{
                return callback(null, []);
            }
        })
    }
}

exports.taskToGetUserSockets = taskToGetUserSockets;


function addSocketToDB(socketId, userId, socketType, callback){
    async.waterfall([
        function(callback){
            sockets.checkIfUserOnline(userId, function(err, res){
                    if(res){
                        callback(null, {userId: userId, in:true});
                    }else{
                        callback(null, {userId: userId, in:false});
                    }
                });
        },
        function(userItem, callback){
            if(userItem.in) {
                log.info("socket/common/libs:: Add to list");
                sockets.addToList(userItem.userId, {cType:socketType, id: socketId}, callback);
            }else{
                log.info("socket/common/libs:: Add new user " + socketType);
                sockets.addNewUser(userItem.userId, {cType:socketType, id: socketId}, callback);
            }
        }
    ], function(err){
        if(err) throw err;
        else callback(null);
    })
}

exports.addSocketToDB = addSocketToDB;