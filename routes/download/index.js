/**
 * Created by anton on 30/09/15.
 */
var config = require('../../config');
var staticHost = config.get('general:staticHost');

var fs = require('fs');
var crypto = require('crypto');
//var privateKey = fs.readFileSync(config.get('staticServerAuth:privateKey')).toString('ascii');

module.exports = function(app){
    app.get('/download/:id', function(req, res, next) {
        var id = req.params.id;
        var data = id + req.user._id;
        var sData = crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'hex');
        res.redirect(staticHost + '/download/'+ data + '?surl='+ sData);
        next();
    });
}



