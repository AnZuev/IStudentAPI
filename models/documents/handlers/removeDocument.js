var Document;


module.exports = function(documentId, userId, callback){
	Document = this;
	taskToUpdateRemove(documentId, userId, 5, callback);
};


function taskToUpdateRemove(documentId, userId, errCounter, callback){
	Document.update(
		{
			_id:documentId,
			author: userId
		},
		{
			enabled: false,
			toDelete: true
		},
		function(err, result){
		if(err) {
			if(errCounter > 5) {
				return callback({exception: true, code: 500, err: err});
			}
			taskToUpdateRemove(documentId, userId, ++errCounter, callback)
		}
		else{
			if(result.n == 0){
				return callback({exception: true, code: 403, err: err});
			}else if(result.nModified == 1){
				return callback(null, true);
			}
		}
	})
}