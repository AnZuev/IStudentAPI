/**
 * Created by anton on 17/02/15.
 */
var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.get('mongoose:uri'));

module.exports = mongoose;

