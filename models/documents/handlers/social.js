var Document;
var async = require('async');
var dbError = require('../../../error').dbError;

exports.addLike = function(documentId, userId, callback){
	Document = this;
	taskToAddLike(documentId, userId, 0, callback);
};

exports.addDislike = function(documentId, userId, callback){
	Document = this;
	taskToAddDislike(documentId, userId, 0, callback);
};

exports.addWatch = function(documentId, callback){
	Document = this;
	taskToAddWatch(documentId, 0, callback);
};

exports.addDownload = function(documentId, userId, callback){
	Document = this;
	taskToAddDownload(documentId, userId, 0, callback);
};

exports.addComment = function(documentId, comment, callback){
	Document = this;
	comment.created = new Date();
	taskToAddComment(documentId, comment, 0, callback);
};

exports.getComments = function(documentId, skipFromEnd, callback){
	Document = this;
	taskToGetComments(documentId, skipFromEnd, callback);
}


function taskToAddLike(documentId, userId, errCounter, callback){
	Document.update(
		{_id:documentId},
		{
			$addToSet: {"social.likes": userId },
			$pull: {"social.dislikes": userId}
		},
		function(err, result){
		if(err) {
			if(errCounter > 5) {
				return callback({exception: true, code: 500, err: err});
			}
			taskToAddLike(documentId, userId, ++errCounter, callback)
		}
		else{
			if(result.n == 0){
				return callback({exception: true, code: 403, err: err});
			}else if(result.nModified == 1){
				return callback(null, true);
			}else{
				return callback(null, false);
			}
		}
	})
}

function taskToAddDislike(documentId, userId, errCounter, callback){
	Document.update(
		{_id:documentId},
		{
			$addToSet: {"social.dislikes": userId },
			$pull: {"social.likes": userId}
		},
		function(err, result){
			if(err) {
				if(errCounter > 5) {
					return callback({exception: true, code: 500, err: err});
				}
				taskToAddDislike(documentId, userId, ++errCounter, callback)
			}
			else{
				if(result.n == 0){
					return callback({exception: true, code: 403, err: err});
				}else if(result.nModified == 1){
					return callback(null, true);
				}else{
					return callback(null, false);
				}
			}
		})
}

function taskToAddWatch(documentId, errCounter, callback){
	Document.update(
		{_id:documentId},
		{
			$inc: {"social.watches": 1 }
		},
		function(err, result){
			if(err) {
				if(errCounter > 5) {
					return callback({exception: true, code: 500, err: err});
				}
				taskToAddWatch(documentId, ++errCounter, callback)
			}
			else{
				if(result.n == 0){
					return callback({exception: true, code: 404, err: err});
				}else if(result.nModified == 1){
					return callback(null, true);
				}
			}
		})
}

function taskToAddDownload(documentId, userId, errCounter, callback){
	Document.update(
		{_id:documentId},
		{
			$addToSet: {"social.downloads": userId },
		},
		function(err, result){
			if(err) {
				if(errCounter > 5) {
					return callback({exception: true, code: 500, err: err});
				}
				taskToAddDownload(documentId, userId, ++errCounter, callback)
			}
			else{
				if(result.n == 0){
					return callback({exception: true, code: 404, err: err});
				}else if(result.nModified == 1 || result.n == 1){
					return callback(null, true);
				}
			}
		})
}

function taskToAddComment(documentId, comment, errCounter, callback){

	Document.update(
		{_id:documentId},
		{
			$push: {"social.comments": comment }
		},
		function(err, result){
			if(err) {
				if(errCounter > 5) {
					return callback({exception: true, code: 500, err: err});
				}
				taskToAddComment(documentId, comment, ++errCounter, callback)
			}
			else{
				if(result.n == 0){
					return callback({exception: true, code: 404, err: err});
				}else if(result.nModified == 1){
					return callback(null, true);
				}
			}
		})
}

function taskToGetComments(documentId, skipFromEnd, callback){
	if(skipFromEnd < 20){
		skipFromEnd = 20;
	}
	Document.findOne(
		{
			_id:documentId
		},
		{
			"social.comments":{
				$slice:[-1*skipFromEnd, 20 ]
			}
		},
		function(err, document){
			return callback(err, {_id: document._id, comments: document.social.comments});
		}
	)
}