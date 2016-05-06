exports.post = function(req, res){
    if(res.req.header['X-Requested-With'] == 'XMLHttpRequest'){
        req.session.user = null;
        res.end();
    }

};