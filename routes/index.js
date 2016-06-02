var config = require('../config');
var host = config.get('general:host');
var log = require('../libs/log')(module);
var publicStaticServer = config.get('general:publicStaticServer');
var welcomePagetemplates = require('../views/frontEndTemplates/greetingsScreen');


module.exports = function(app){

    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.get('/oldPage', function(req, res, next){ //  /
        res.render('welcomePage', {
            host: host,
	        publicStaticServer: publicStaticServer
        });
        next();
    });

	app.get('/', function(req, res, next){

		res.render('greetingsScreen', {
            host: host,
			publicStaticServer: publicStaticServer,
			templates: welcomePagetemplates
		});
		next();
	});

    require('./authorize')(app);
    require('./general')(app);
	// require('./calendar')(app);
    require('./im')(app);
    //require('./staticServer')(app);
	require('./service')(app);
	require('./staticData/universities')(app);
	require('./staticData/subjects')(app);





	//test
    app.get('/socketIO', function(req, res, next){
        res.render('socketIO');
    })






}
