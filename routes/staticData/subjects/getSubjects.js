var util = require('util');
var SI = require('../../../models/subject').subject;

exports.get = function(req, res, next){
	var title = req.query.title;
	

	if (title) {
		title = '^' + title;
		title = new RegExp(title, "i");
		SI.getSubjectsByTitle(title, function (err, result) {
			if (err) {
				if(err.code == 204)
				{
					res.statusCode = 204;
					res.json([]);
					res.end();
				}
				else{
					next(err);
				}
			} else {
				res.json(result);
				res.end();
				next();
			}
		})
	}else {
		SI.getAllSubjects(function(err,result) {

			if(err) next(err);
			else {
				res.json(result);
				res.end();
				next();
			}
		})
	}
};

