var DbError = require('../../error').DbError;
var AuthError = require('../../error').AuthError;
var calendarNew = require("../../models/calendarNews").calendarNews;
var Event = require('../../models/Events').Event;
var calendarConstructor = require('../../views/partials/calendarModuleConstructor.json');
var async = require('async');
var config = require('../../config');
var host = config.get('general:host');

exports.get = function(req, res, next){
    async.parallel([
        function(callback){
            var dateInterval = makeDateInterval();
            Event.findFromDateToDateShort(req.user._id, dateInterval.startTime, dateInterval.finishTime,function(err, results){
                if(err) return callback(new DbError(500, "Произошла ошибка при выборке из бд events "+ err));
                else{
                    return callback(null, results);
                }
            })
        },
        function(callback){
            calendarNew.getCalendarNewsForUser(req.user._id, function(err, results){
                if(err) return callback(new DbError(500, "Произошла ошибка при выборке из бд calendsarNew "+ err));
                else{
                    return callback(null, results);
                }
            });
        }

    ], function(err, results){
        if(err) {
            console.error("Произошла ошибка при обработке запроса /calendar");
            return next(err);
        }else{
            res.render('calendar',{
                calendarNews: results[1],
                jsonCalendarModuleConstructor: calendarConstructor,
                shortEventsDescription: results[0],
                host: host
            });
            return next();

        }
    })


};


function makeDateInterval(){
    var date = new Date();
    var startTime = new Date(date.getFullYear(), date.getMonth(), 1);
    var finishTime = new Date(date.getFullYear(), date.getMonth()+1, 1 );
    var dateInterval = {
        startTime:startTime,
        finishTime: finishTime
    };
    return dateInterval;
}

