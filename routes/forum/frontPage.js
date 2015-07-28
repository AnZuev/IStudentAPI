
var HttpError = require('../../error').HttpError;



exports.get = function(req, res, next){
    res.render('layout/ForumMainPage',{text: res.locals.cars});
    next();
};

