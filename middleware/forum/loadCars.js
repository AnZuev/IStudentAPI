var fs = require('fs');
module.exports = function(req, res, next){
    res.locals.cars = fs.readFileSync("./public/static/cars.txt",'utf-8');
    next();

}
