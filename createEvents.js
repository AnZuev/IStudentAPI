/**
 * Created by anton on 03/08/15.
 */

var Event = require('./models/Events').Event;
var User = require('./models/User').User;

var ObjectId = require('mongoose').Schema.Types.ObjectId;

/*
for(var i = 0; i< 25; i++){
    var idArray = ["55c05ed72631f5d19fc0b0df","55c05ed72631f5d19fc0b0e2","55c05ed72631f5d19fc0b0e1", "55c05ed72631f5d19fc0b0de", "55c05ed72631f5d19fc0b0e0", "55c05ed72631f5d19fc0b0e4","55c05ed72631f5d19fc0b0e6", "55c05ed72631f5d19fc0b0e7","55c05ed72631f5d19fc0b0e5", "55c05ed72631f5d19fc0b0e3"];
    var title = 'title ' + i;
    var startTime = new Date(2005, i%12, i);
    var finishTime = new Date(2005, i%12, i+ 2);
    var invites = [];
    var userId = idArray[i%10];
    for(var y=0; y < i%10; y++){
        if(idArray[y] == userId) continue;
        invites.push(idArray[y]);
    }
    var place = 'место' + i;
    var description = 'описание ' + i;
    var type = 'На всех студентов';


    Event.addEvent(title, startTime, finishTime, '', invites,place, description, type, userId, function(err, event){
        if(err) throw err;
        else{
            console.log(event);
            return;
        }
    })
}
*/



/*
for(var x = 0; x< 10; x++){
    var firstName =  "Имя "+ x;
    var lastName = 'Фамилия ' + x;
    var groupNumber = 4300 + x;
    var faculty = "Кти";
    var year = x%6;
    var studNumber = groupNumber*100+x;
    var password = 'hotwinter';
    var user = new User({
        personal_information:{
            firstName: firstName,
            lastName: lastName,
            groupNumber:groupNumber,
            faculty: faculty,
            year: year
        },
        auth:{
            studNumber: studNumber,
            password: password
        }
    })
    user.save(function(err, user){
        if(err) throw err;
        else{
            console.log(user);
        }
    })
}
*/

var userId = "55c05ed72631f5d19fc0b0e0";
var startTime = '2004-12-30T22:00:00Z';
var finishTime = "2012-02-02T22:00:00Z";
var eventId = "55c064fb2767c214a06e92a7";
var invites = [];
var period = "два раза в неделю";
var place = "Новое место";
var type =  "Новый тип";

/*
Event.findFromDateToDate(userId, startTime, finishTime, function(err, events){
    if(err) throw err;
    console.log(events);
})
*/
/*
Event.accept(userId, eventId, function(err, events){
    if(err) throw err;
    console.log(err, events);
})
*/



Event.removeEvent(eventId, userId, function(err){
    if(err) throw err;
    else{
        console.log("Я закончил");
    }
})
