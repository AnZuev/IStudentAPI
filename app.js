var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var log = require('./libs/log')(module);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var HttpError = require('./error').HttpError;
var DbError = require('./error').DbError;
var morgan = require('morgan')

var config = require('./config');
var mongoose = require('./libs/mongoose');







var app = express();





app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({mongoose_connection: mongoose.connection})
}));
app.use(require('./middleware/sendErrors/sendHttpError'));
app.use(require('./middleware/sendErrors/sendDbError'));
app.use(require('./middleware/auth/loadUser'));



// development error handler

require('./routes')(app);

// error handlers
// production error handler
// no stacktraces leaked to user


app.use(function(err, req, res, next) {
    if(err){
        if(typeof err == "number"){
            err = new HttpError(err);
        }
        if(err instanceof HttpError){
            res.sendHttpError(err);
        }else if(err instanceof DbError){
            res.sendDBError(err);
        }else{
            res.status(err.status || 500);
        }
        res.end(500);
    }else{
        next();
    }


});




module.exports = app;
