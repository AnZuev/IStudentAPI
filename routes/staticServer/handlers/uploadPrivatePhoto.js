var uploadFileHandler = require('../libs/addFileAndSendRequestToUpload');

exports.post = function(req, res, next){
	uploadFileHandler(req, res, "uploadPrivatePhoto", next);
};