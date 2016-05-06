var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;



var Suggest = new Schema({
    address:{
        type: String,
        require: false
    },
    topic:{
        require: false,
        type:String
    },
    idea:{
        require: false,
        type: String
    },
    senderSession:{
        require: true,
        type: Schema.Types.ObjectId
    },
    created:{
        type: Date,
        require:true,
        default: Date.now
    },
	new:{
		type: Boolean,
		require: true,
		default:true
	}

});



Suggest.statics.addSuggestion = function(suggest, callback){

    suggest.save(function(err){
        if(err) return callback(err);
        else return callback(null);
    });

};

Suggest.statics.read = function(id, callback){
	this.update({_id: id},{new: false}, callback);
};

exports.Suggest = mongoose.model('Suggest', Suggest);



