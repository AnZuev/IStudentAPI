var User = require('../../../models/User/index').User;
var async = require('async');
var httpError = require('../../../error').HttpError;
var file = require('../../../models/file').file;
exports.post = function(req, res, next){
	var url = req.body.url;

	try{
		if(url.length < 10){
			var err = new Error("Некорректный url");
			next(err);
		}
	}catch(e){
		return next(400);
	}

	async.waterfall([
		function(callback){
			file.getFileByUrl(url, callback);
		},
		function(file, callback){
			if(file){
				if(file.uploader != req.session.user){
					return callback(new httpError(403, "Action forbidden"));
				}
				return callback(null, file);
			}
		}, function(file, callback){
			User.updatePhoto(req.session.user, url, callback);
		}
	], function(err, result){
		if(err){
			if(err.code == 404){
				return next(new httpError(400, "Bad request"));
			}else{

				return next(new httpError(500, "Error happened. Please, try again later"));
			}
		}
		if(result) {
			file.markFileUsed(url, function(err, res){
				var resp = {
					updated: true,
					url: url
				};
				res.json(resp);
				res.end();
			});

		}
	})

}