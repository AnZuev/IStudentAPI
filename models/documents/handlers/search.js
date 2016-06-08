var Document;
var log = require('../../../libs/log')(module);
var util = require('util');
var mongoose = require('mongoose');
var dbError = require(appRoot+'/error').dbError;

exports.getDocById = function(documentId, callback){
	Document = this;
	taskToFindById(documentId, 0, callback);
};

function taskToFindById(documentId, errCounter, callback){
	Document.findById(documentId, function(err, document){
		if(err){
			if(errCounter < 5 ) taskToFindById(documentId, ++errCounter, callback);
			log.error('Documents::GetDocByIdError happened' + util.format(err));
			return callback({exception: true, code: 500, err: err})
		}else{	
			return callback(null, document);
		}
	});
}


exports.getDocsBy = function(title, context, callback){
	Document = this;
	context = validateContext(context);
	if(title){
		context["title"] = title;
	}
	taskToFindDocsBy(context, 0, callback);
};


function taskToFindDocsBy(context, errCounter, callback){

	Document.aggregate([
		{
			$match: context
		},
		{
			$project:{
				title: "$title",
				author: "$author",
				social: "$social", //TODO подумать над тем, чтобы возвращать не все комменты
				search: "$search",
				parts: "$parts",
				rating: { $size:"$social.downloads"}
			}
		},
		{
			$limit : 20
		}
	], function(err, documents){
			if(err){
				if(errCounter < 5 ) taskToFindDocsBy(context, ++errCounter, callback);
				log.error('Documents::GetDocsByError happened' + util.format(err));
				return callback({exception: true, code: 500, err: err})
			}else{
				if(documents.length == 0) return callback(new dbError(null, 204, "No documents were found"));
				return callback(null, documents);
			}
		})
}


function validateContext(rawContext){
	var context ={};

	for(var key in rawContext){
		switch (key){
			case "university":
				context["search.universities"]=  mongoose.Types.ObjectId(rawContext[key]);
				break;
			case "faculty":
				context["search.faculties"] =  mongoose.Types.ObjectId(rawContext[key]);
				break;
			case "year":
				context["search.year"] = rawContext[key];
				break;
			case "subject":
				context["search.subject"]=  mongoose.Types.ObjectId(rawContext[key]);
				break;
			case "type":
				context["search.cType"] =  mongoose.Types.ObjectId(rawContext[key]);
				break;
			case "title":
				context.title = rawContext[key];
				break;
		}
	}

	return context;
}