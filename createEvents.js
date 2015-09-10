/**
 * Created by anton on 03/08/15.
 */

var Event = require('./models/Events').Event;
var User = require('./models/User').User;


Event.accept("55c05ed72631f5d19fc0b0df","55c064fb2767c214a06e9291", function(err, result){
    console.log(arguments);
})

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

*/
/*
var userId = "55c05ed72631f5d19fc0b0ds";
var startTime = '2004-12-30T22:00:00Z';
var finishTime = "2004-12-31T22:00:00Z";
var eventId = "55c064fb2767c214a06e92a7";
var invites = [];
var period = "два раза в неделю";
var place = "Новое место";
var type =  "Новый тип";
var title = 'Событие для проверки работы метода';

var description = 'описание ';

console.log(finishTime > startTime);
Event.findFromDateToDateShort(userId, startTime, finishTime, function(err, events){
    console.log(events);
})

Event.addEvent(title, startTime, finishTime, '', invites,place, description, type, userId, function(err, event){
    if(err) throw err;
    else{
        console.log(event);
        return;
    }
})
var keyword = "Имя 2 Фамилия";
var options = {
    lean:true
}
*/

/*
var firstName = 'Георгий';
var lastName = 'Попов';
var group = 4304;
var faculty = 'KTI';
var year = 1;
var studNumber = 430410;
var password = 'qwerty1234';
/*
for(var i = 0; i < 10; i++){
    User.signUp(firstName, lastName, group, faculty, year, studNumber+i+1, password, function(err, user){
        if(err) throw err;
        else{
            console.log(user);
        }
    })
}



User.getPeopleByGroupNumber(group, function(err, users){
    if(err) throw err;
    else{
        console.log(users);
    }
})
*/