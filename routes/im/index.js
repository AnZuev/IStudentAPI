var checkAuthAndActivation = require('../../middleware/auth/checkAuth').checkAuthAndActivation;
var loadDataForIm = require('../../middleware/loadDataForConversation');


module.exports = function(app){
    app.get('/im', checkAuthAndActivation, loadDataForIm, require('./im').get);
};
