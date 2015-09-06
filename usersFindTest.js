/**
 * Created by anton on 03/08/15.
 */

var User = require('./models/User').User;

var group = 4304;
var name = 'А';
var surname = "Зуев";

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

/*
var firstNames = ['Георгий', "Георг", "Антон", "Ант", "Кирилл"];
var lastNames = ['Попов', "Езеров", "Ильин", "Зуев", "Горбунов"];
var group = 4304;
var faculty = 'KTI';
var year = 1;
var studNumber = 43022310;
var password = 'qwerty1234';

 for(var i = 0; i < 10; i++){
 User.signUp(firstNames[i%5], lastNames[i%5], group, faculty, year, studNumber+i+1, password, function(err, user){
 if(err) throw err;
 else{
 console.log(user);
 }
 })
 }
 */