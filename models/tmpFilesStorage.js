var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;



var tmpFile = new Schema({
	action:{
		type: String,
		require: true
	},
	fileName:{
		type: String
	},
	fileId:{
		type: Schema.Types.ObjectId
	},
	userId:{
		type: Schema.Types.ObjectId
	},
    created:{
        type: Date,
        require:true,
        default: Date.now,
	    expires: 60*60*1000
    }
});



tmpFile.statics.addTmpFile = function(action, userId, callback){
	var file = new this({
		action: action,
		userId: userId
	});
	addTmpFile(file, callback);
};

tmpFile.statics.getActionBykey = function(key, callback){
	addTmpFile(this, callback);
};




exports.tmpFile = mongoose.model('tmpFile', tmpFile);


function addTmpFile(file,callback){
	file.save(function(err, result){
		if(err) addTmpFile(file, callback);
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

