var Document;
var async = require('async');
var log = require(appRoot+'/libs/log')(module);
var taskToAddDocument = require('./addDocument').taskToAddDocument;

exports.addPart = function(documentId, userId, newPart, callback){
	var tmpDoc;
	Document = this;
	async.waterfall([
		function(callback){
			Document.findOne({_id: documentId, author: userId}, callback);
			/*
			function(err, document, ...)
			 */
		},
		function(document, callback){
			if(document){
				if(document.parts){
					var flag = false;
					document.parts.forEach(function(part){
						if(part.url == newPart.url){
							flag = true;
						}
					});
					if(flag){
						return callback({exception:true, code:204, document: document});
					}
					newPart.serialNumber = document.parts.length;
				}else{
					newPart.serialNumber = 0;
				}
				tmpDoc = document;
				return callback(null);
			}else{
				callback({exception: true, code:403});
			}
		},
		function(callback){
			taskToAddPart(documentId, userId, newPart, 0, callback);

		}
	],function(err, result){
		// console.log(arguments);
		if(err){
			if(err.code == 700){
				return callback({exception: true, code:403});
			}else{
				return callback(err);
			}
		}else{
			if(result){
				return callback(null, tmpDoc);
			}else{
				log.error('Document::addPart - как это вывелось - непонятно. Проверить алгоритм!');
			}
		}
	})
};

function taskToAddPart (documentId, userId, part, errCounter, callback){

	Document.update(
		{_id:documentId, author:userId},
		{
			$push: { parts: part }
		},
		function(err, result){
			if(err) {
				if(errCounter > 5) {
					return callback({exception: true, code: 500, err: err});
				}else{
					taskToAddPart(documentId, userId, part, ++errCounter, callback)
				}
			}
			else{
				if(result.n == 0){
					return callback(
						{
							exception: true,
							code: 700,
							err:"Documents::addPart - Не был найден документ, который был провалидирован"
						}
					)
				}else if(result.nModified == 1){
					return callback(null, true);
				}
			}
		})
}

exports.removePart = function(documentId, userId, partId, callback){
	Document = this;
	async.waterfall([
		function(callback){
			Document.findOne({_id: documentId, author: userId, "parts._id": partId}, callback);
		},
		function(document, callback){
			if(document){
				var index = -1;
				for(var i = 0; i < document.parts.length; i++){
					if(document.parts[i]._id == partId.toString()){
						index = i;
						break;
					}
				}
				document.parts.splice(i, 1);
				document.parts.forEach(function(part, tIndex){
					document.parts[tIndex].serialNumber = tIndex;
				});
				return callback(null, document);
			}else{
				return callback({exception:true, code:403, message:"No document found"});
			}
		},
		function(document, callback){
			taskToAddDocument(document, 0, callback);
		}
	],callback);
};



