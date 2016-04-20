var subject = require('../models/subject').subject;

// subject.addSubject("Математика", function(err,res){
//     console.log(arguments);
// });
// subject.activate('57175af61cba3b680db5c9a9', function(err,res) {
//
// });

// subject.getSubjectsByTitle('Математика', function(err,res) {
//
//     console.log(arguments);
// });

//
// subject.getSubjects('57175af61cba3b680db5c9a9', function(err,res) {
//
//     console.log(arguments);
// });


// subject.getSubjectsName('57175af61cba3b680db5c9a9', function(err,res) {
//
//     console.log(arguments);
// });

subject.getAllSubjectsName(function(err,res) {

    console.log(arguments);
});