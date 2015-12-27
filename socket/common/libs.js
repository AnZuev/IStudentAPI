/**
 * Created by anton on 05/12/15.
 */
var async = require('async');

var listOfOnlineUsers = require('./listOfOnlineUsers').onlineUsers;

function taskToGetUserSockets(userId, socketType){
    return function(callback){
        listOfOnlineUsers.getSocketsByUserIdAndType(userId, socketType, function(err, result){

            if(err) return callback(null, []);
            console.log(result);
            return callback(null, result.sockets[0].sockets);
        })
    }
}

exports.taskToGetUserSockets = taskToGetUserSockets;


function addSocketToDB(socketId, userId, callback){
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
                listOfOnlineUsers.addToList(userItem.userId, {type:"ns", sockets: socketId}, callback);
            }else{
                listOfOnlineUsers.addNewUser(userItem.userId, {type:"ns", sockets:[socketId]}, callback);
            }
        }
    ], function(err){
        if(err) throw err;
        else callback(null);
    })
}

exports.addSocketToDB = addSocketToDB;