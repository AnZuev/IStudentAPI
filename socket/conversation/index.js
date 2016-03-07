var log = require('../../libs/log')(module);
var config = require('../../config');


module.exports = function(io){
    var im = require('./imInterface').im;
    im.start(io);


};