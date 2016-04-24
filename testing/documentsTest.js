var Document = require('../models/documents').document;


var simpleItem = "56dc4ecc380e1b4e768fe12e";
var document = {
	title: "Первый документ",
	author: simpleItem,
	search:{
		universities:[simpleItem],
		faculties:[simpleItem],
		year:[1,2],
		subject:[simpleItem],
		cType: simpleItem
	},
	parts:[]
};

/*
Document.addDocument(document, function(err, result){
	console.log(arguments);
});
*/
/*
Document.removeDocument("56fe8ea7a9771ebe0dd4247d", simpleItem, function(err, result){
	console.log(arguments);
});
*/
/*
Document.addDislike("56fe8ea7a9771ebe0dd4247d", simpleItem, function(err, result){
	console.log(arguments);
});
*/
/*
var part = {
	id: "56fe9c4ca960bcce0e748715",
	url: "url/to/download"
}
Document.addPart("56fe9c4ca960bcce0e74871f", simpleItem, part, function(err, result){
	console.log(result);
});


Document.removePart("56fe9c4ca960bcce0e74871f", simpleItem, "56fe9c4ca960bcce0e748713", function(err, result){
	console.log(arguments);
});
*/
/*
Document.addDownload("56fe9c4ca960bcce0e74871f", simpleItem, function(err, result){
	console.log(arguments);
})
	*/

/*
Document.addWatch("56fe9c4ca960bcce0e74871f", function(err, result){
	console.log(arguments);
})
	*/
/*
var comment = {
	text: "Привет!",
	author: simpleItem
}
Document.addComment("56fe9c4ca960bcce0e74871f", comment, function(err, result){
	console.log(arguments);
})
	*/
/*
Document.getDocumentById("56fe9c4ca960bcce0e74871f", function(err, result){
	console.log(arguments);
})
	*/
var title = new RegExp("Первы", 'ig');
var context = {
	university: "56dc4ecc380e1b4e768fe12e",
	faculty: "56dc4ecc380e1b4e768fe12e",

}


Document.getDocsBy(title, context, function(err, result){
	console.log(result);
})