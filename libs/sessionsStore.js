var session = require('express-session');
var config = require('../config');


var MongoStore = require('connect-mongo')(session);

var sessionStore = new MongoStore({url: config.get("mongoose:uri")});

module.exports = sessionStore;