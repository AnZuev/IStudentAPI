var crypto  = require('crypto');
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var async = require('async');
var AuthError = require('../error').AuthError;
var badDataError = require('../error').badDataError;
var DbError = require('../error').DbError;



var User = new Schema({
    personal_information:{
        firstName:{
            type:String,
            require: true
        },
        lastName:{
            type:String,
            require: true
        },

        photoUrl:{
            type: String,
            require: false,
            default: ''
        },
        faculty:{
          type: String,
          require:true
        },
        groupNumber:{
            type: Number,
            require: true
        },
        year:{
            type: Number,
            require:true
        }
    },
    auth: {
        studNumber:{
            require: true,
            type:Number,
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
    searchString:{
        type:String,
        require: true
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

User.statics.validateData = function(first_name, last_name, groupNumber, faculty, year, studNumber, password){
    return (((typeof first_name == "string") && (typeof last_name == "string") && (typeof faculty =="string") && (typeof year == "number") && (typeof studNumber == "number") && (first_name.length >= 2) && (last_name.length >= 3) && (year > 1) && (year < 6) && (faculty.length >= 2) && studNumber > 10000));
};

User.statics.changePhotoUrl = function(user_id, new_photo_url, callback){
    var User = this;
    User.findByIdAndUpdate(user_id, {"personal_information.photoUrl": new_photo_url}, function(err){
        if(err) return callback(err);
        return callback(null);
    })
};

User.statics.signIn = function(studNumber, password, callback){
    var User=this;
    async.waterfall([
        function(callback){
            User.findOne({"auth.studNumber": studNumber}, callback)
        },
        function(user, callback){
            if(user){
                if(user.checkPassword(password)){
                    callback(null, user);
                    console.log("авторизация прошла успешно");
                }else{
                    callback(new AuthError("Неверный пароль"));
                    // неверный пароль
                }
            }else{
                callback(401);
            }
        }
    ],callback);
};

User.statics.signUp = function(first_name, last_name, groupNumber, faculty, year, studNumber,  password, callback){
    var User = this;
    /*if(!User.validateData(first_name, last_name, groupNumber, faculty, year, studNumber, password)) {
        return callback(new badDataError());
    }
    */
    //else{
        async.waterfall([
            function(callback){
                User.findOne({"auth.studNumber": studNumber}, callback)
            },
            function(user, callback){
                if(user){
                    return callback(new AuthError("Пользователь с таким номером студака уже есть"));
                }else{
                    console.log('Сохраняю пользователя');
                    var new_user = new User({
                        personal_information:{
                            firstName: first_name,
                            lastName: last_name,
                            groupNumber:groupNumber,
                            faculty: faculty,
                            year: year
                        },
                        auth:{
                            studNumber: studNumber,
                            password: password
                        },
                        searchString: first_name + " " + last_name + " " + groupNumber
                    });
                    new_user.save(function(err){
                        if(err) return callback(err);
                        else return callback(null, new_user);

                    });
                }

            }
        ], callback);
    //}

};

User.statics.getPeopleByGroupNumber = function(groupNumber, callback){
    var query = this.aggregate([{$match:{ "personal_information.groupNumber": groupNumber }},
            {$project:
            {
                student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
            }
            },{$sort:{student: 1}}
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0) return callback(new DbError(404, "Не нашел юзеров для группы " + groupNumber));
        else{
            return callback(null, users);
        }
    });

   /*
    this.find({"personal_information.groupNumber": groupNumber}).select({_id:1}).exec(function(err, users){
        if(err) return callback(new DbError(500, "Произошла ошибка при поиске юзеров для группы " + groupNumber));
        if(users.length == 0) return callback(new DbError(404, "Не нашел юзеров для группы " + groupNumber));
        else{
            return callback(null, users);
        }
    })
    */
}

User.statics.getPeopleByName = function(name, callback){
    var query = this.aggregate([{$match: {searchString:{$regex: name}}},
            {$project:
                {
                    student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
                }
            },{$sort:{student: 1}}
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new DbError(204, 'No users found'));
        }else{
            return callback(null, users);
        }
    });
}

User.statics.getPeopleByNameAndGroup = function(name, groupNumber, callback){
    var query = this.aggregate([{$match: {$and:[{searchString:{$regex: name}}, {"personal_information.groupNumber": groupNumber}]}},
            {$project:
                {
                    student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
                }
            },{$sort:{student: 1}}
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new DbError(204, 'No users found'));
        }else{
            return callback(null, users);
        }
    });
};

User.statics.getPeopleByNameAndSurnameAndGroup = function(name, surname, groupNumber, callback){
    var query = this.aggregate([{$match: {$and:[{searchString:{$regex: name}}, {searchString:{$regex: surname}}, {"personal_information.groupNumber": groupNumber}]}},
            {$project:
            {
                student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
            }
            },{$sort:{student: 1}}
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new DbError(204, 'No users found'));
        }else{
            return callback(null, users);
        }
    });
};


User.statics.getPeopleByNameAndSurname = function(name, surname, callback){
    var query = this.aggregate([{$match: {$and:[{searchString:{$regex: name}}, {searchString:{$regex: surname}}]}},
            {$project:
            {
                student:{$concat:["$personal_information.lastName", " ", "$personal_information.firstName"]}
            }
            },{$sort:{student: 1}}
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new DbError(204, 'No users found'));
        }else{
            return callback(null, users);
        }
    });
};

User.methods.acceptOrDeclineEvent = function(userId,eventId, callback){
    User.update({_id: userId}, {$pull:{"calendar.invites": eventId }}, function(err){
        if(err) return callback(new DbError("Не получилось удилать элемент из массива calendar.invites " + eventId));
        else return callback(null);
    });
}

User.methods.recieveInviteToEvent = function(userId,eventId, callback){
    User.update({_id: userId}, {$push:{"calendar.invites": eventId }}, function(err){
        if(err) return callback(new DbError("Не получилось добавить элемент в массив calendar.invites " + eventId));
        else return callback(null);
    });
}




exports.User = mongoose.model('User', User);



