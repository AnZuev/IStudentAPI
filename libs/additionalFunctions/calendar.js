var User = require('../../models/User/index').User;
var calendarNews = require('../../models/calendarNews').calendarNews;
var DbError = require('../../error').DbError;
var async = require('async');
var errors = [];
var nsItem = require('../../socket/notificationService/nsInterface').nsItem;
require('./extensionsForBasicTypes.js');



function modifyEventCreateCalendarNewsAndNotifications(event, oldParticipants){
    async.waterfall([
        function(callback){
            User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(callback);
        },
        function(user, callback){
            try{
                var newParticipants = (event.participants.invites || []).concat(event.participants.accepted || []).sort();
                var peopleToAdd = newParticipants.diffSortArr(oldParticipants);
                var peopleToRemove = oldParticipants.diffSortArr(newParticipants); // получаем массив с id людей для удаления

                var titleNotif =  user.personal_information.lastName + " " + user.personal_information.firstName; //
                var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
                var message = "Приглашаю на событие '" + event.title + "' " + makeDateStringFromDateObj(event.time.start) + ". Идешь?";
                var tasks = [];

                var calendarNew = {
                    eventName:  "calendarInvite",
                    title: title,
                    message: event.description,
                    eventId: event._id
                };
                for(var i = 0;  i< peopleToRemove.length; i++){
                    tasks.push(removeNew(peopleToRemove[i]));
                }
                for(i = 0;  i< peopleToAdd.length; i++){
                    var calendarNewItem = {
                        to: peopleToAdd[i],
                        from: event.creator,
                        notification:calendarNew
                    };
                    tasks.push(addNew(calendarNewItem));
                }
                async.parallel(tasks, function(err, recievers){
                    if(err) {
                        console.error("Произошла необработанная ошибка " + err);
                        throw err;
                    }
                    if(errors.length > 0){
                        console.warn('При добавлении/удалении в calendarNews возникали ошибки. Количество ошибок - ' + errors.length); //залогировать ошибки в файл
                    }
                    var options = {
                        eventId: event._id
                    };
                    var ns = new nsItem("calendarInvite", titleNotif, message, user.personal_information.photoUrl, options);
                    ns.send(recievers);
                });
            }catch(err){
                console.log(err);
                return callback(err);
            }
        }
    ]);
}

exports.modifySendNotifications = modifyEventCreateCalendarNewsAndNotifications;

//получить новый массив инвайтов
// достать из базы старый массив инвайтов
// отсортировать каждый массив
// высчитать разницу для получения списка юзеров для удаления
// высчитать разницу для получения списка добавления
// добавить/удалить, ошибки не должны никак влиять на работу с другими уведомлениями
// на выходе получаем массив юзеров, которым надо отправить нотификации, если они онлайн. Нужно передать notification сервису


function createCalendarNewsAndNotifications(event, callback){
    User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return callback(err);
        if(!user) return (callback(new DbError(404, "Произошла ошибка при поиске юзера - юзера нет. Как он создал событие  - хрен его знает")));
        else{
            var titleNotif =  user.personal_information.lastName + " " + user.personal_information.firstName; //
            var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
            var participants = event.participants.invites.sort();
            var message = "Приглашаю на событие '" + event.title + "' " + makeDateStringFromDateObj(event.time.start) + ". Идешь?";
            var tasks = [];
            var calendarNew = {
                eventName:  "calendarInvite",
                title: title,
                message: event.description,
                eventId: event._id
            };
            for(var i = 0;  i< participants.length; i++){
               var calendarNewItem = {
                  to: participants[i],
                  from: event.creator,
                  notification:calendarNew
               };
               tasks.push(addNew(calendarNewItem));
            }
            async.parallel(tasks, function(err, recievers){
                if(err) {
                    console.error(err);
                    throw err;
                }
                if(errors.length > 0){
                    console.warn('При добавлении в calendarNews возникали ошибки. Количество ошибок - ' + errors.length); //залогировать ошибки в файл
                }
                var options = {
                    eventId: event._id
                };
                var ns = new nsItem("calendarInvite", titleNotif, message, user.personal_information.photoUrl, options);
                ns.send(recievers);
            });
        }

    })
}

exports.createCalendarNewsAndNotifications = createCalendarNewsAndNotifications;





function sendNotificationForAcceptDecline(userId, event, notifType){
    User.findById(userId).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return callback(err);
        if(!user) return (callback(new DbError(404, "Произошла ошибка при поиске юзера - юзера нет. Как его умудрились пригласить - непонятно")));
        else{
            var title =  user.personal_information.lastName + " " + user.personal_information.firstName; //
            var message = "Я иду на '" + event.title + "' " + makeDateStringFromDateObj(event.time.start) + ".";
            options = {
                eventId: event._id,
                type: notifType
            };
            var recievers =  event.participants.accepted.concat(event.participants.invites);
            recievers.push(event.creator);
            recievers.splice(recievers.indexOf(userId)-1, 1);
            var ns = new nsItem("calendarNotify", title, message, user.personal_information.photoUrl, options);
            ns.send(recievers);
        }
    })
}

exports.sendNotificationForAcceptDecline = sendNotificationForAcceptDecline;



function addNew(calendarNewItem){
    return function(callback){
        calendarNews.addNew(calendarNewItem, function(err, calendarNewItem){
            if(err){
                console.error('Произошла ошибка при добавлении записи в calendarNews ' + err);
                errors.push(err);
                return callback(null)
            }else{
                return callback(null, calendarNewItem.to);
            }

        })
    }
}

function removeNew(eventId, userId){
    return function(callback){
        calendarNews.removeNewByEvent(eventId, userId, function(err){
            if(err){
                errors.push(err);
                console.error('Произошла ошибка при удалении записи из calendarNews ' + err);
            }
            return callback(null);


        })
    }
}

function makeDateStringFromDateObj(date){
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    var day = date.getDate();
    return (day + ' ' + month + " " + year);
}


