var express = require('express');
var path = require('path');
var log = require('./libs/log')(module);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var HttpError = require('./error').HttpError;
var dbError = require('./error').dbError;
var morgan = require('morgan');

var config = require('./config');
var mongoose = require('./libs/mongoose');


global.appRoot = path.resolve(__dirname);

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var session = require('express-session');
app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    resave: false,
    saveUninitialized: true,
    store: require('./libs/sessionsStore')
}));

app.use(require(appRoot + '/testing/testMiddleware/api_key-auth')); // TODO: убрать во время боевого запуска


app.use(require('./middleware/sendErrors/sendHttpError'));
app.use(require('./middleware/sendErrors/sendDbError'));
app.use(require('./middleware/auth/loadUser'));

require('./routes')(app);



app.use(function(err, req, res, next) {
    if(err){
	    console.error(err);
        if(typeof err == "number"){
	        err = new HttpError(err);
        }
        if(err instanceof HttpError){
	        // res.send(err.get()); // не работает?
            res.sendHttpError(err);
        }else if(err instanceof dbError){
            res.sendDBError(err);
        }else{
            res.statusCode = (err.status || 500);
        }
    }
	res.end();
	next();

});

module.exports = app;
