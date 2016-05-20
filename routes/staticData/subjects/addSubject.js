var util = require('util');
var SI = require('../../../models/subject').subject;
var HttpError = require('../../../error/index').HttpError;

exports.post = function(req, res, next){

	var title = req.body.title;
	console.log(title);
	try {
		if (title.length > 0) {
			SI.addSubject(title, function (err, result) {
				if (err) {
					next(err);
				} else {
					res.json(result);
					res.end();
					next();
				}
			})
		}else{
			throw "s";
		}
	}catch(e){
		var err = new HttpError(400, util.format("Не переданы все необходимые параметры"));
		next(err);
	}


};

