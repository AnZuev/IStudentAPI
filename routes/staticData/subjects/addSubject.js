var UI = require('../../../models/subject').subject;
var httpError = require('../../../error/index').HttpError;

exports.post = function(req, res, next){

	var title = req.body.title;


	if(title.length > 0) {
		UI.addSubject(title, function (err, result) {
			if (err) {
				next(err);
			} else {
				res.json(result);
				res.end();
				next();
			}
		})
	} else{
		var err = new httpError(400, "Не переданы все необходимые параметры");
		next(err);
	}
};

