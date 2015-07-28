var HttpError = require('../../error').HttpError;

exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        if(res.locals.questionTemplate){
                res.send(res.locals.questionTemplate);
                res.end();
        }else{
            next(new HttpError(500))
        }
    }
    else{
        next(400);
    }

};
