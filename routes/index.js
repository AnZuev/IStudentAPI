
module.exports = function(app){

    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    app.get('/', function(req, res, next){
        res.render('welcomePage');
        next();
    })
    require('./authorize')(app);
    require('./general')(app);
    require('./calendar')(app);

    app.get('/socketIO', function(req, res, next){
        res.render('socketIO');
    })






}
