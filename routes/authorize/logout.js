exports.post = function(req, res){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        req.session.user = null;
        res.end();

    }


};