var checkAuth = require('../../middleware/auth/checkAuth');
var checkEventHaving = require('../../middleware/calendar/checkEventHaving');

module.exports = function(app){
    app.put('/calendar/event', require('./addEvent').put); // create
   // app.post('/calendar/:eventId', checkAuth, checkEventHaving, require('./modifyEvent').post); // modify
  //  app.delete('/calendar/:eventId', checkAuth, checkEventHaving, require('./deleteEvent').delete);
    app.get('/calendar', function(req, res, next){
        res.send('календарь');
        res.end();
    })
}
