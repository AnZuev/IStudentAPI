var UI = require('./../models/university').university;
var FI = require('./../models/university').faculty;

var faculties = [
	{
		title: "ФКТИ"
	},
	{
		title: "ФЭА"
	},
	{
		title: "ФЭЛ"
	},
	{
		title: "ФЭМ"
	},
	{
		title: "ФРТ"
	},
	{
		title: "ГФ"
	}
];
/*UI.addUniversity("СПБГЭТУ, ЛЭТИ", "Улица профессора Попова", 5, "Санкт-Петербург", 0,  function(err, res){
	UI.addFacultiesToUniversity(res._id, faculties, function(err, facult){
		console.log(arguments);
	})
});*/



UI.getFaculties("56d6bcd1017cf10359b31292",function(err, res){
	console.log(err);
});
UI.getFacultyName("56d6bcd1017cf10359b3129b", "56dab169d41242256d8b8d08", function(err, res){
	//console.log(res);
})