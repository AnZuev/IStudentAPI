var subject = require('../models/subject').subject;

// subject.addSubject("Физика", 0, function(err,res){
//     console.log(arguments);
// });
subject.activate('570c01d1f8117f2010813b8d', function(err,res) {
    console.log(arguments);
});