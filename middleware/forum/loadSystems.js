var fs = require('fs');
module.exports = function(req, res, next){
    res.locals.systems = fs.readFileSync("public/static/systems.txt",'utf-8');
    next();

}
