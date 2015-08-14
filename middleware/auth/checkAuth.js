var HttpError = require('../../error').HttpError;

module.exports = function(req, res, next){
    if(!req.session.user) req.session.user ='55c05ed72631f5d19fc0b0df'; //return next(new HttpError(401, "Вы не авторизованы"));
    return next();
}