var checkAuth = require('../../middleware/auth/checkAuth');
var findUsers = require('../../middleware/auth/findUsers');


module.exports = function(app){
    app.post('/auth/signUp', require('./signUp').post);
    app.post('/auth/signIn', require('./signIn').post);
    app.post('/auth/logout', require('./logout').post);
    app.get('/auth/checkAuth', checkAuth, function(req, res){
        res.send(req.user._id);
        res.end();
    });

    app.get('/user/find',  findUsers);

}
