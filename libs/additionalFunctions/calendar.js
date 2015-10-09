var User = require('../../models/User').User;
var calendarNews = require('../../models/calendarNews').calendarNews;
var DbError = require('../../error').DbError;
var async = require('async');
var errors = [];


function modifyCalendarNews(event, oldParticipants){

    User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return (err);
        else{
            try{
                var newParticipants = event.participants.invites.concat(event.participants.accepted).sort();
                oldParticipants = oldParticipants.sort();
                var peopleToRemove = diffSortArr(oldParticipants,newParticipants); // получаем массив с id людей для удаления
                var peopleToAdd = diffSortArr(newParticipants, oldParticipants);

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
                var notification = {
                    eventName:  "calendarInvite",
                    title: titleNotif,
                    message: message,
                    eventId: event._id,
                    photoUrl: user.personal_information.photoUrl || "http://pre-static.istudentapp.ru/images/noAvatar.png"
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
                async.parallel(tasks, function(err, results){
                    if(err) {
                        console.error("Произошла необработанная ошибка " + err);
                        throw err;
                    }
                    if(errors.length > 0){
                        console.warn('При добавлении/удалении в calendarNews возникали ошибки. Количество ошибок - ' + errors.length); //залогировать ошибки в файл
                    }
                    return callback(null, results, notification);
                });
            }catch(e){
                re
            }





        }
    })
}

function intersecSortArr(A,B){
    var M = A.length, N = B.length, C = [],
        m = 1, n = 1, k = 0, a = 0, b = 0;
    for (var i = 1, t = A[0]; i < M; i++)
    {
        if (A[i] !== t)
        {
            A[m++] = A[i]; t = A[i];
        }
    }

    for ( i = 1, t = B[0]; i < N; i++)
    {
        if (B[i] !== t){
            B[n++] = B[i]; t = B[i];
        }
    }

    while (a < m && b < n)
    {
        if (A[a] < B[b]) ++a;
        else if (A[a] > B[b]) ++b;
        else C[k++] = A[a++];
    }
    return C;
}

function diffSortArr(A,B){
    var C = intersecSortArr(A,B),
        M = A.length,
        N = C.length;

    for (var i=0, k=0, a=0, c=0; i<M+N; i++)
    {
        if (A[a] === C[c]){
            ++a; ++c;
        }
        else{
            A[k] = A[i];
            k++; a++;
        }
    }
    A.length = k;
    return A;
}

exports.modifyCalendarNews = modifyCalendarNews;





//получить новый массив инвайтов
// достать из базы старый массив инвайтов
// отсортировать каждый массив
// высчитать разницу для получения списка юзеров для удаления
// высчитать разницу для получения списка добавления
// добавить/удалить, ошибки не должны никак влиять на работу с другими уведомлениями
// на выходе получаем массив юзеров, которым надо отправить нотификации, если они онлайн. Нужно передать notification сервису



function addCalendarNews(event, callback){
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
            var notification = {
                eventName:  "calendarInvite",
                title: titleNotif,
                message: message,
                eventId: event._id,
                photoUrl: user.personal_information.photoUrl || "http://pre-static.istudentapp.ru/images/noAvatar.png"
            };

            for(var i = 0;  i< participants.length; i++){
               var calendarNewItem = {
                  to: participants[i],
                  from: event.creator,
                  notification:calendarNew
               };
               tasks.push(addNew(calendarNewItem));
            }

            async.parallel(tasks, function(err, results){
                if(err) {
                    console.error(err);
                    throw err;
                }
                if(errors.length > 0){
                    console.warn('При добавлении в calendarNews возникали ошибки. Количество ошибок - ' + errors.length); //залогировать ошибки в файл
                }
                return callback(null, results, notification);
            });


        }

    })
}

exports.createNotificationList = addCalendarNews;


function createNotificationListForEventParticipants(userId, event, notifType, callback){
    User.findById(userId).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return callback(err);
        if(!user) return (callback(new DbError(404, "Произошла ошибка при поиске юзера - юзера нет. Как его умудрились пригласить - непонятно")));
        else{
            var titleNotif =  user.personal_information.lastName + " " + user.personal_information.firstName; //
            var message = "Я иду на '" + event.title + "' " + makeDateStringFromDateObj(event.time.start) + ".";

            var notification = {
                eventName:  "calendarNotify",
                type: notifType,
                title: titleNotif,
                message: message,
                eventId: event._id,
                photoUrl: user.personal_information.photoUrl || "http://pre-static.istudentapp.ru/images/noAvatar.png"
            };
            var recievers =  event.participants.accepted.concat(event.participants.invites);
            recievers.push(event.creator);
            console.log(recievers);
            recievers.splice(recievers.indexOf(userId)-1, 1);
            console.log(recievers);
            return callback(null,recievers, notification);
        }
    })

}

exports.createNotificationListForEventParticipants = createNotificationListForEventParticipants;
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


