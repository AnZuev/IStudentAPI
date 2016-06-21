var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;



var document = new Schema({
    title:{
	    type: String,
	    required: true
    },
	author:{
		type: Schema.Types.ObjectId,
		required: true
	},
	created:{
		type: Date,
		default: Date.now()
	},
	social:{
		downloads:[Schema.Types.ObjectId],
		watches: {
			type: Number,
			default:0
		},
		likes:[Schema.Types.ObjectId],
		dislikes:[Schema.Types.ObjectId],
		comments:[
			{
				author: {
					type: Schema.Types.ObjectId,
					required: true
				},
				created:{
					type: Date,
					default: Date.now()
				},
				text: String
			}
		]
	},
	search:{
		universities:[Schema.Types.ObjectId], // id универов, в которых встречалась данная работа
		faculties: [Schema.Types.ObjectId], // id факультетов, в которых встречалась данная работа
		year: [Number], // курс
		subject: Schema.Types.ObjectId, // id предмета
		cType: Schema.Types.ObjectId //лаба, курсовая и тд
	},
	parts:[
		{
			url: String, // ссылка на файл для скачивания
			serialNumber: Number // номер файла в данной работе(1, 2 и тд)
		}
	],
	enabled: {
		type: Boolean,
		default: true
	},
	toDelete:{
		type: Boolean,
		default: false
	}
});


/* add + remove part start */

document.statics.addDocument = require('./handlers/addDocument').addDocument;

document.statics.removeDocument = require('./handlers/removeDocument');


/* add + remove part finish */




/* social part starts */

document.statics.addLike = require('./handlers/social').addLike;

document.statics.addDislike = require('./handlers/social').addDislike;

document.statics.addWatch = require('./handlers/social').addWatch;

document.statics.addComment = require('./handlers/social').addComment;

document.statics.getComments = require('./handlers/social').getComments;

document.statics.addDownload = require('./handlers/social').addDownload;



/* social part ends */



/* content part starts */

document.statics.addPart = require('./handlers/content').addPart;

document.statics.removePart = require('./handlers/content').removePart;

/* content part ends */



/* search part starts */

document.statics.getDocById = require('./handlers/search').getDocById;

document.statics.getDocsBy = require('./handlers/search').getDocsBy;

document.statics.getComments = require('./handlers/social').getComments;


/* search part ends */



exports.document = mongoose.model('document', document);



