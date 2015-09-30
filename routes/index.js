var config = require('../config');
var host = config.get('general:host');
module.exports = function(app){

    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    app.get('/', function(req, res, next){
        res.render('welcomePage', {
            host: host
        });
        next();
    })
    require('./authorize')(app);
    require('./general')(app);
    require('./calendar')(app);
    require('./im')(app);
    require('./download')(app);



    //test
    app.get('/socketIO', function(req, res, next){
        res.render('socketIO');
    })






}
