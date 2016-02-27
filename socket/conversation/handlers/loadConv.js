/**
 * Created by anton on 25/01/16.
 */

var log = require('../../../libs/log')(module);
var conversation = require('../../../models/conversation').conversation;
var User = require('../../../models/User').User;
var sockets = require('../../common/sockets').sockets;


var wsError = require('../../../error').wsError;
var dbError = require('../../../error').dbError;


var async = require("async");


var libs = require('../libs/libs');
/*
 1) Вызываем метод базы данных getMessages
 2) Если ошибка - возвращаем wsError c кодом 400
 3) Если беседа не найдена  - возвращаем  wsError с кодом 403
 4) Если длина сообщение равна 0 - возвращаем wsError c кодом 204
 5) В противном случае отдаем conv


 */
module.exports = function(socket, data, cb){
    if(data.convId){
        async.waterfall([
            function(callback){
                conversation.getConvById(data.convId, socket.request.headers.user.id, callback);
            },
            function(conv, callback){

                if(conv.participants.length == 2) libs.loadPrivateConvInfo(conv,socket.request.headers.user.id, callback);
                else if(conv.participants.length > 2){
                    libs.loadGroupConvInfo(conv, socket.request.headers.user.id, callback);
                }
            }
        ],function(err, conv){
            if(err) return cb(new wsError(500).sendError());
            cb(conv);
        })
    }else if(data.userId){
        async.waterfall([
            function(callback){
                conversation.getPrivateConvByParticipants(data.userId, socket.request.headers.user.id, callback);
            },
            function(conv, callback){
                libs.loadPrivateConvInfo(conv,socket.request.headers.user.id, callback);
            }
        ],function(err, conv){
            if(err){
                if(err instanceof dbError) return cb(new wsError(err.code, err.message).sendError());
                return cb(new wsError(500).sendError());
            }
            cb(conv);
        })
    }else{
        return cb(new wsError(400, "Bad request"))
    }


};

