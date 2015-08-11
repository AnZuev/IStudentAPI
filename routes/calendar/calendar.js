var HttpError = require('../../error').HttpError;
var AuthError = require('../../error').AuthError;
var calendarNew = require("../../models/calendarNews").calendarNews;
var Event = require('../../models/Events').Event;
var calendarConstructor = require('../../views/partials/calendarModuleConstructor.json');


exports.get = function(req, res, next){
   calendarNew.getCalendarNewsForUser(req.user._id, function(err, results){
       if(err){
           console.error('Произошла ошибка при попытке взять новости для календаря для юзера ' +  req.user._id);
           results = [];
       }else{

       }

       res.render('calendar',{
           calendarNews: results,
           jsonCalendarModuleConstructor: calendarConstructor
       });
   })
};


