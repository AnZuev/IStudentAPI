/**
 * Created by anton on 03/08/15.
 */

var User = require('./../models/User').User;

var group = 4304;
var name = 'А';
var surname = "Зуев";
/*
User.getPeopleByGroupNumber(group, function(err, result){
    console.log(arguments);
})
User.getPeopleByName(name, function(err, result){
    console.log(arguments);
})

User.getPeopleByNameAndGroup(surname, group, function(err, result){
    console.log(arguments);
})
User.getPeopleByNameAndSurnameAndGroup(name, surname, group, function(err, result){
    console.log(arguments);
})
*/
/*
var firstNames = ['Георгий', "Георг", "Антон", "Ант", "Кирилл", "Леша", "Сергей", "Паша"];
var lastNames = ['Попов', "Езеров", "Ильин", "Зуев", "Горбунов", "Павлюк", "Комаров"];
var group = 4304;
var faculty = 'KTI';
var year = 1;
var studNumber = 43029899;
var password = 'qwerty1234';

 for(var i = 0; i < 10; i++){
 User.signUp(firstNames[i%8], lastNames[i%7], group, faculty, year, studNumber+i+1, password, function(err, user){
 if(err) throw err;
 else{
 console.log(user);
 }
 })
 }

var userId = ["5611659632ede0011018e974", "561163f932ede0011018e96f"]
User.getPeopleByOneKey(new RegExp("4303", "i"), function(err, callback){
	console.log(arguments);
});
/*User.getUserById(userId, function(err, user){
    console.log(user);
})

for(var i = 0; i<userId.length; i++){
    User.removeContacts(userId[i], function(err, user){
        console.log(arguments);
    })
}
*/

User.activate("anzuev@bk.ru", "44a1f39b454a0df16639a9d0c98f51481ffe68a5", function(err, res){
	console.log(arguments);
})