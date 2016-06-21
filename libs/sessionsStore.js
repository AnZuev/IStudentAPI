var session = require('express-session');
var config = require('../config');


var MongoStore = require('connect-mongo/es5')(session);

var sessionStore = new MongoStore({url: 'mongodb://127.0.0.1/test_IStudentAPI'});

module.exports = sessionStore;