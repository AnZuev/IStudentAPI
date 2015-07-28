exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
          res.send(res.locals.models.split(','));
        next();
    }
    else{
        next(400);
    }

};
