var crypto  = require('crypto');
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;
var async = require('async');
var AuthError = require('../error').AuthError;

var User = new Schema({
    personal_information:{
        first_name:{
            type:String,
            require: true
        },
        last_name:{
            type:String,
            require: true
        },

        photo_url:{
            type: String,
            require: false,
            default: ''
        },
        about:{
            type: String,
            require: false,
            default: ''
        }

    },
    auth: {
        mail:{
            type:String,
            require: true,
            unique: true
        },
        hashed_password:{
            type:String,
            require: true
        },
        salt:{
            type:String,
            require: true
        }
    },

    about_experience:{
        title:{
            type: String,
            default: "Новичок"
        },
        rating:{
            type:Number,
            default: 0
        },
        questions_counter:{
            type: Number,
            default: 0
        },
        answers_counter:{
            type: Number,
            default:0
        },
        spam_counter:{
            type: Number,
            default: 0
        }

    },

    about_car:{
        car:{
            type: String
        },
        model:{
            type: String
        },
        year:{
            type: Number
        },
        photos:[
            {
                photo_url:{
                    type: String,
                    require: true
                }
            }
        ],
        engine_volume:{
            type: Number
        },
        engine_type:{
            type: String
        },
        transmission_type:{
            type: String
        },
        body_type:{
            type: String
        },
        run:{
            type: Number
        }

    }
});

User.methods.encryptPassword = function(password){
    return crypto.createHmac('sha1',this.auth.salt).update(password).digest("hex");
};

User.virtual('auth.password')
    .set(function(password) {
        this.auth._plainPassword = password;
        this.auth.salt = Math.random() + "";
        this.auth.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword;} );

User.methods.checkPassword = function(password){
    return (this.encryptPassword(password) === this.auth.hashed_password);
};

User.statics.changePhotoUrl = function(user_id, new_photo_url, callback){
    var User = this;
    User.findByIdAndUpdate(user_id, {"personal_information.photo_url": new_photo_url}, function(err){
        if(err) return callback(err);
        return callback(null);
    })
};

User.statics.signIn = function(mail, password, callback){
    var User=this;
    async.waterfall([
        function(callback){
            User.findOne({"auth.mail": mail}, callback)
        },
        function(user, callback){
            if(user){
                if(user.checkPassword(password)){
                    callback(null, user);
                    //console.log("авторизация прошла успешно");
                }else{
                    callback(new AuthError("Неверный пароль"));
                    // неверный пароль
                }
            }
        }
    ],callback);
};

User.statics.signUp = function(first_name, last_name, password, mail, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findOne({"auth.mail": mail}, callback)
        },
        function(user, callback){
            if(user){
                return callback(new AuthError("Пользователь с такой почтой уже есть"));
            }
           var new_user = new User({
               personal_information:{
                   first_name: first_name,
                   last_name: last_name
               },
               auth:{
                  mail: mail,
                  password: password
               }
           });
           new_user.save(function(err){
              if(err) return callback(err);
              return callback(null, new_user);
              });
      }
    ], callback);
};

User.statics.update_rating = function(user_id, rating_increment, callback){

}

exports.User = mongoose.model('User', User);



