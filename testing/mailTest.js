var mailNS = require('../notifications/mail').mailNS;

var ns = new mailNS("Hello world", "", "auth", "Привет");

ns.send("anzuev@bk.ru");