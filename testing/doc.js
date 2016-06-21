'use strict';

let Documents = require('../models/documents').document;



let document = {
	title: "Лабораторная работа 5",
	author: "57571a94fea46302bbd604d5",
	search: {},
	parts:[
		{
			url: "575f0aff1b9d548d07870811"
		}
	]
};

Documents.addDocument(document, function(err, res){
	console.log(arguments)
});

let comment = {
	author: "57571a94fea46302bbd604d5",
	text: "Привет"
};
/*Documents.addComment("575823a0495ead75d13363cc", comment, function(err, res){
	console.log(arguments)
});*/

/*

Documents.getComments("575823a0495ead75d13363cc", 0, function(err, res){
	//console.log(res);
	/!*res.comments.forEach(function(comment){
		console.log(comment);
	})*!/
});

Documents.getDocumentById("575823a0495ead75d13363cc", function(err, res){
	console.log(res.social);
	/!*res.comments.forEach(function(comment){
	 console.log(comment);
	 })*!/
});*/
