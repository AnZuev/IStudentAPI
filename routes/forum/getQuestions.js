var DbError = require('../../error').DbError;
var HttpError = require('../../error').HttpError;


exports.get = function(req, res, next){

    var questions = res.locals.questions;
    if(questions){
        res.send(JSON.stringify(questions));
        res.end();
        return next();
    }else{

        return next();
    }




};
