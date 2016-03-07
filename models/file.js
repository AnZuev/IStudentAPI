var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
require('../libs/additionalFunctions/extensionsForBasicTypes');
var dbError = require('../error').dbError;

var file = new Schema({
	fileName:{
		type: String
	},
	uploader:{
		type: Schema.Types.ObjectId
	},
    created:{
        type: Date,
        require:true,
        default: Date.now,
	    expires: 60*60*1000
    },
	allow:[Schema.Types.ObjectId],
	access: String
});



file.statics.addFile = function(action, uploader, allow, callback){
	var file = new this({
		uploader: uploader,
		access: "private"
	});
	if(allow == "all"){
		file.access = "public";
	}else if(!allow) {
		allow = [];
		allow.push(uploader);
		file.allow = allow;
	}else{
		allow.push(uploader);
		file.allow = allow.unique();
	}
	addFileTask(file,5, callback);
};

file.statics.getActionBykey = function(key, callback){
	addTmpFile(this, callback);
};

file.statics.getFileById = function(id, callback){
	this.findById(id, function(err, file){
		if(err) return callback(new dbError(err, 500, "Ошибка во время получения файла из бд"));
		else{
			if(file) return callback(null, {id: id, uploader: file.uploader});
			else return callback(new dbError(err, 404, "Ошибка во время получения файла из бд"));
		}
	})
}



module.exports.file = mongoose.model('file', file);


function addFileTask(file, errCounter, callback){
	file.save(function(err, result){
		if(err) {
			if(errCounter > 5) return callback(err);
			addFileTask(file, ++errCounter, callback);
		}
		else{
			return callback(null, result);
		}
	})
}

function getActionByKey(file, callback){
	file.findById(key, function(err, result){
		if(err) return callback(err);
		else{
			return callback(null,result);
		}
	});
}

