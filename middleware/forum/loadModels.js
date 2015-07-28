var fs = require('fs');
module.exports = function(req, res, next){
    var car = req.query.car;
    try{
        res.locals.models = fs.readFileSync("public/static/models/"+car+".txt",'utf-8');
    }catch(e){
        throw e;
    }
    next();
}
