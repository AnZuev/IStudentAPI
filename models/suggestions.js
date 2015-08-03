var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;



var Suggest = new Schema({
    address:{
        type: String,
        require: true
    },
    additional:{
        require: false,
        type:String
    },
    idea:{
        require: true,
        type: String
    },
    created:{
        type: Date,
        require:true,
        default: Date.now
    }

});



Suggest.statics.addSuggestion = function(suggest, callback){

    suggest.save(function(err){
        if(err) return callback(err);
        else return callback(null);
    });

}


exports.Suggest = mongoose.model('Suggest', Suggest);



