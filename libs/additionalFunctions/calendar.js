var User = require('../../models/User').User;
var calendarNews = require('../../models/calendarNews').calendarNews;
var DbError = require('../../error').DbError;
var async = require('async');

function modifyCalendarNews(event, oldParticipants){
    User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return (err);
        else{
            var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
            var newParticipants = event.participants.invites.concat(event.participants.accepted).sort();
            oldParticipants = oldParticipants.sort();
            var peopleToRemove = diffSortArr(oldParticipants,newParticipants); // получаем массив с id людей для удаления
            var peopleToAdd = diffSortArr(newParticipants, oldParticipants);
            async.parallel([
                function(callback){
                    var errorsArray = [];
                    var flag = false;
                    for(var i = 0;  i< peopleToRemove.length; i++){
                        calendarNews.removeNewByEvent(event._id, peopleToRemove[i], function(err){
                            if(err) {
                                console.error('Произошла ошибка при удалении записи из calendarNew ' + err);
                                flag = true;
                                errorsArray.push({info: {eventId:event._id, userId: peopleToRemove[i]}, err: err});
                            }

                        })
                    }
                    if(flag) return callback(null, errorsArray);
                    else return callback(null);

                },
                function(callback){
                    var flag = false;
                    var errorsArray = [];
                    var successArray = [];
                    for(var i = 0;  i< peopleToAdd.length; i++){
                        var calendarNewItem = {
                            to: peopleToAdd[i],
                            from: event.creator,
                            notification:{
                                type:  "invite",
                                title: title,
                                message: event.description,
                                eventId: event._id
                            }
                        };
                        calendarNews.addNew(calendarNewItem, function(err, calendarNewItem){
                            if(err){
                                errorsArray.push({info: calendarNewItem, err: err});
                                flag = true;
                                console.error('Произошла ошибка при добавлении записи в calendarNews ' + err);
                            }else{
                                successArray.push(calendarNewItem);
                            }

                        })
                    }
                    if(flag) callback(null, errorsArray, successArray);
                    else callback(null, errorsArray, successArray);
                }
            ],function(err, errors, usersToNotify){
                if(err) throw err;
                //можно записать в файл все ошибки из массива errors, на процесс далее они никак не должны влиять
                return usersToNotify[1];
            })
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
            var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
            var participants = event.participants.invites.sort();
            console.warn(participants);
            var errors = [];
            var successArray = [];
            for(var i = 0;  i< participants.length; i++){
                var notification = {
                    eventName:  "calendarInvite",
                    title: title,
                    message: event.description,
                    eventId: event._id
                };
               var calendarNewItem = {
                  to: participants[i],
                  from: event.creator,
                  notification:notification
               };
               calendarNews.addNew(calendarNewItem, function(err, calendarNewItem){
                  if(err){
                      errors.push({info: calendarNewItem, err: err});
                      console.error('Произошла ошибка при добавлении записи в calendarNews ' + err);
                  }else{
                      successArray.push(calendarNewItem);
                  }

                })
            }

             if(errors.length > 0){
                    console.warn('При добавлении в calendarNews возникали ошибки. Количество ошибок - ' + errors.length); //залогировать ошибки в файл
             }
             console.info('Выполнил функцию для создания списка нотификация, пытаюсь вернуть колбэк с тремя аргументами');
             return callback(null, successArray, notification);
        }

    })
}

exports.createNotificationList = addCalendarNews;

function addNew(calendarNewItem, errors){
    return function(callback){
        calendarNews.addNew(calendarNewItem, function(err, calendarNewItem){
            if(err){
                errors.push({info: calendarNewItem, err: err});
                console.error('Произошла ошибка при добавлении записи в calendarNews ' + err);
            }else{
                return callback(null, calendarNewItem);
            }

        })
    }
}

