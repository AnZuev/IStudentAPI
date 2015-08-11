var User = require('../../models/User').User;
var calendarNews = require('../../models/calendarNews').calendarNews;
var DbError = require('../../error').DbError;

function addCalendarNewsForArrayOfParticipants(event){
    User.findById(event.creator).select({_id:0, "personal_information.firstName":1, "personal_information.lastName":1}).exec(function(err, user){
        if(err) return (err);
        else{
            var title = 'Пользоваетель ' + user.personal_information.firstName +" "+ user.personal_information.lastName + " приглашает Вас на событие '"+ event.title + "'";
            for(var i = 0; i < event.participants.invites.length; i++){
                var calendarNewItem = {
                    to: event.participants.invites[i],
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
                        if(err instanceof DbError){
                            if(err.status == 0){

                            }else if(err.status == 500){
                                return err;
                            }else{
                                return err;
                            }
                        }
                        else{
                            return err;
                        }
                    }else{
                        //разослать нотификации
                    }

                })
            }
        }
    })
}
exports.addCalendarNewsForArrayOfParticipants = addCalendarNewsForArrayOfParticipants;