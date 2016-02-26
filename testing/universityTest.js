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



UI.getFaculties("56cd7a3fe1848ce622923807",function(err, res){
	console.log(res);
});
