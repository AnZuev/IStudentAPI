/**
 * Created by anton on 05/12/15.
 */
var async = require('async');

var listOfOnlineUsers = require('./listOfOnlineUsers').onlineUsers;

function taskToGetUserSockets(userId, socketType){
    return function(callback){
        listOfOnlineUsers.getSocketsByUserIdAndType(userId, socketType, function(err, result){

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
        function( callback){
            listOfOnlineUsers.checkIfUserOnline(userId, function(err, sockets){
                    if(sockets){
                        callback(null, {userId: userId, in:true});
                    }else{
                        callback(null, {userId: userId, in:false});
                    }
                });
        },
        function(userItem, callback){
            if(userItem.in) {
                console.log("socket/common/libs:: Add to list");
                listOfOnlineUsers.addToList(userItem.userId, {cType:socketType, id: socketId}, callback);
            }else{
                console.log("socket/common/libs:: Add new user " + socketType);
                listOfOnlineUsers.addNewUser(userItem.userId, {cType:socketType, id: socketId}, callback);
            }
        }
    ], function(err){
        if(err) throw err;
        else callback(null);
    })
}

exports.addSocketToDB = addSocketToDB;