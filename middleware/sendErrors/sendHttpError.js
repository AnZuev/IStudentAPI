module.exports = function(req, res, next){

    res.sendHttpError = function(error){
        if(res.req.headers['x-requested-with'] === 'XMLHttpRequest'){
	        res.statusCode = error.status || 500;
            res.json({exception: true, reason: error.message, code: error.status || 500});
        }else{
	        res.statusCode = error.status || 500;
	        res.json({exception: true, reason: error.message, code: error.status || 500});
        }
        res.end();
    };
    next();
};