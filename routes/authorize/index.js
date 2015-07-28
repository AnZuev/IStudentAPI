var checkAuth = require('../../middleware/auth/checkAuth');

module.exports = function(app){
    app.post('/api/signUp', require('./signUp').post);
    app.post('/api/signIn', require('./signIn').post);
    app.post('/api/logout', require('./logout').post);
    app.get('/api/checkAuth', checkAuth, function(req, res){

        res.send(req.user._id);
        res.end();
    });
   // app.post('/api/checkMail', require('./checkMail').get);

    //app.get('/api/')
}
