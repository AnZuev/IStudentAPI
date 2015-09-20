var checkAuth = require('../../middleware/auth/checkAuth');

module.exports = function(app){
    app.get('/im', checkAuth, require('./im').get);
}
