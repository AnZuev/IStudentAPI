var User = require('../../../models/User').User;
var files = require('../../../models/file').file;
var async = require('async');
var log = require('../../../libs/log')(module);
module.exports = function(key, callback){
	async.waterfall([
		function(callback){
			files.getFileById(key, callback);
		},
		function(result, callback){
			if(result){
				User.updatePhoto(result.uploader, result.id, callback);
			}
		}
	], function(err, result){
		if(err) {
			log.error(err);
		}
		else{
			if(result){
				log.info("photo has been updated");
			}else{
				log.info("photo hasn't been updated");
			}
		}
		return callback(null);
	})
};