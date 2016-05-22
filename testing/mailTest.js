var mailNS = require('../notifications/mail').mailNS;

var fs = require('fs');
var path = require('path');
var util = require('util');
var link =  "http://pre-api.istudentapp.ru/auth/activate?mail=%s&key=%s";
link = util.format(link, "anzuev@bk.ru",'1234');
fs.readFile(path.join(__dirname, "../notifications/templates/regConfirm.html"), "UTF-8", function(err, data){
	if(err){
		console.log(err);

	}else{
		console.log(data);
		var ns = new mailNS("Подтвердите почтовый адрес", "", "auth", data, "Сообщение не отображается");
		ns.send("anton.zuev.ssq@gmail.com", function(err, result){
			console.log(arguments);
		});

	}
});