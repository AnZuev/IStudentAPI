var checkAuth = require('../../middleware/auth/checkAuth');


module.exports = function(app){
    app.put('/calendar/event', checkAuth, require('./addEvent').put); // create
    app.post('/calendar/:eventId', checkAuth, require('./modifyEvent').post); // modify
    app.delete('/calendar/:eventId', checkAuth, require('./removeEvent').del); // remove event
    app.get('/calendar/events', checkAuth, require('./getEvents').get);
    app.post('/calendar/:eventId/accept', checkAuth, require('./acceptEvent').post);
    app.post('/calendar/:eventId/decline', checkAuth, require('./declineEvent').post)
    app.get('/calendar', checkAuth, require('./calendar').get);
    app.get('/calendar/:eventId', checkAuth, require('./getEvent').get);

}
