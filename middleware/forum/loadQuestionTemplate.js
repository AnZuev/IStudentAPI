var HttpError = require('../../error').HttpError;
var fs = require('fs');
module.exports = function(req, res, next){
    res.locals.questionTemplate = null;
    res.locals.questionTemplate = fs.readFileSync("./public/static/temp.json",'utf-8');
    next();
}

