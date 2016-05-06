exports.post = function(req, res){
    if(res.req.headers['x-requested-with'] == 'XMLHttpRequest'){
        req.session.user = null;
        res.end();
    }

};