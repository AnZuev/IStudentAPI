var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var badDataError = require('../error').badDataError;
var DbError = require('../error').DbError;
var async = require('async');




var bZItem = new Schema({
    created:{
        type: Date,
        require:true,
        default:Date.now
    },
    type: {
        type: String,
        require: true
    },
    markers:[{
      year:{
          type: Number,
          require:true
      },
      faculty:{
          type: String,
          require: true
      },
      university:{
          type: String,
          require: true
      }
    }],
    about:{
        title:{
            type: String,
            require: true
        },
        rating:{
            type: String,
            require: true
        },
        author:{
            name:{
                type: String,
                require: true
            },
            id:{
               type: Schema.Types.ObjectId,
                require: true
            }
        },
        teacher:{
            name:{
                type: String,
                require: true
            },
            id:{
                type: Schema.Types.ObjectId,
                require: true
            }
        },
        downloaded:{
            type: Number,
            require: true,
            default: 0
        },
        likes:{
            type: Number,
            require: true,
            default:0
        },
        dislikes:{
            type: Number,
            require: true,
            default:0
        }
    }



});

bZItem.statics.add = function(){

}


exports.BZItem = mongoose.model('bZItem', bZItem);



