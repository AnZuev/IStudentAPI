var checkAuth = require('../../middleware/auth/checkAuth').checkAuthAndRedirect;
var loadDataForIm = require('../../middleware/auth/loadDataForConversation');


module.exports = function(app){
    app.get('/im', checkAuth, loadDataForIm, require('./im').get);
};
