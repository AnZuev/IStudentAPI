exports.get = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
          res.send(res.locals.cars.split(','));
        next();
    }
    else{
        next(400);
    }

};
