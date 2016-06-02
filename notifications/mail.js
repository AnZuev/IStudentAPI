var config = require('../config');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');




var mailBoxes = {
	auth: {
		mail: "auth@istudentapp.ru",
		password: "quetbxdfpzhtsnid"
	},
	restorePassword: {
		mail: "auth@istudentapp.ru",
		password: "quetbxdfpzhtsnid"
	}

};

function mailNS(mTopic, mCc, address, htmlSource, plainTextSource){
	var topic = mTopic;
	var cc = mCc;
	var from = mailBoxes[address].mail;
	var password = mailBoxes[address].password;

	var options = {
		debug: true,
		host: 'smtp.yandex.ru',
		port: 465,
		secure: true,
		auth: {
			user: from,
			pass: password
		},
		tls: {rejectUnauthorized: false}
	};
	var transport = nodemailer.createTransport(smtpTransport(options));


	this.send = function(to, callback){
		transport.sendMail({
			from: from,
			to: to,
			html: htmlSource,
			text: plainTextSource,
			subject: topic
		},callback);
	}

}

exports.mailNS = mailNS;






