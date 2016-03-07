var uploadAvatarCompleted = require('../libs/uploadAvatarCompleted');


exports.put = function(req, res, next){
	switch(req.headers.action){
		case "uploadAvatar":
			uploadAvatarCompleted(req.headers.key, function(){res.end();});
			break;
		case "uploadPrivateDocument":

	}
	console.log(req.headers);
	res.json({result: "done"});
	res.end();
	next();
};

// загружали документ в беседу
//загружали фото в беседу
// загружали аватарку
// загружали документ(любой) в базу знаний

