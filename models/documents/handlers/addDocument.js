var async = require('async');
var dbError = require('../../../error').dbError;

exports.addDocument = function(document,callback){
	var Document = this;
	try{
		document.parts.forEach(function(element, index){
			document.parts[index].serialNumber = index;
		});
	}catch(e){
		document.parts = [];
	}


	var newDoc = new Document({
		title: document.title,
		author: document.author,
		search: document.search,
		parts: document.parts
	});
	taskToAddDocument(newDoc, 5, callback);
};



function taskToAddDocument(document, errCounter, callback){
	document.save(function(err, result){
		if(err) {
			if(errCounter > 5) {
				return callback({exception: true, code: 500, err: err});
			}
			taskToAddDocument(document, ++errCounter, callback);
		}
		else{
			return callback(null, result);
		}
	})
}
exports.taskToAddDocument = taskToAddDocument;