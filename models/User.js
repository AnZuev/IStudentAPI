var crypto  = require('crypto');
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var async = require('async');
var authError = require('../error').authError;
var dbError = require('../error').dbError;
var log = require('../libs/log')(module);





var User = new Schema({
    auth: {
        studNumber:{
            require: true,
            type: String,
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

    pubInform:{
        name:{
            type:String,
            require: true
        },
        surname:{
            type:String,
            require: true
        },
        photo:{
            type: String,
            require: false,
            default: ''
        },
        university:{
            type: Number,
            require: true
        },
        faculty:{
          type: String,
          require:true
        },
        group:{
            type: String,
            require: true
        },
        year:{
            type: Number,
            require:true
        }
    },

    prInform:{
        mail:{
            type: String
        },
        phone:{
            type: String
        }
    },

    privacy:{
        blockedUsers:[Schema.Types.ObjectId]
    },

    contacts:[Schema.Types.ObjectId],

    projects:[{}],

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
                    log.info("Авторизация прошла успешно");
                }else{
                    callback(new authError("Неверный пароль"));
                }
            }else{
                callback(new authError("Не найден юзер"));
            }
        }
    ],function(err, user){
        if(err){
            if(err instanceof dbError || err instanceof authError){
                return callback(err);
            }else{
                return callback(new dbError(err, null, null));
            }
        }
        callback(null,user);
    });
};

User.statics.signUp = function(name, surname, group, faculty, university, year, studNumber,  password, callback){
    var User = this;
        async.waterfall([
            function(callback){
                User.findOne({"auth.studNumber": studNumber}, callback)
            },
            function(user, callback){
                if(user){
                    return callback(new authError("Пользователь с номером студенческого " + studNumber +" уже есть"));
                }else{
                    var newUser = new User({
                        pubInform:{
                            name: name,
                            surname: surname,
                            group:group,
                            faculty: faculty,
                            year: year,
                            university: university
                        },
                        auth:{
                            studNumber: studNumber,
                            password: password
                        },
                        searchString: name + " " + surname + " " + group + " " + university
                    });
                    newUser.save(function(err, user){
                        if(err) {
                            return callback(new dbError(err, null, null));
                        }
                        else {
                            return callback(null, user);
                        }
                    });
                }
            }
        ], function(err, user){
            if(err){
                if(err instanceof dbError || err instanceof authError){
                    callback(err);
                }else{
                    throw err;
                    callback(new dbError(err, null, null));
                }
            };
            callback(null, user);
        });
};




/*
 * Поиск по пользователям
 *
 */


User.statics.getPeopleByGroupNumber = function(group, callback){
    var query = this.aggregate([{$match:{ "pubInform.group": group }},
            {
                $project:
                    {
                        _id: "$_id"
                    }
            }
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0) return callback(new dbError(null, 204, null));
        else{
            return callback(null, users);
        }
    });
};

User.statics.getPeopleByOneKey = function(key, callback){

    var query = this.aggregate([{$match: {searchString:{$regex: key}}},
            {
                $project:
                {
                    student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                    group: "$pubInform.group",
                    description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                    photo: "$pubInform.photo"

                }
            },
            {
                $sort:{student: 1}
            }
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new dbError(null, 204, null));
        }else{
            return callback(null, users);
        }
    });
};

User.statics.getPeopleByTwoKeys = function(key1, key2, callback){
    var query = this.aggregate([{$match: {$and:[{searchString:{$regex: key1}}, {searchString:{$regex: key2}}]}},
        {
            $project:
            {
                student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                group: "$pubInform.group",
                description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                photo: "$pubInform.photo"
            }
        },
        {
            $sort:{student: 1}
        }
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new dbError(null, 204, null));
        }else{
            return callback(null, users);
        }
    });
};

User.statics.getPeopleByThreeKeys = function(key1, key2, key3, callback){
    var query = this.aggregate([{$match: {$and:[{searchString:{$regex: key1}}, {searchString:{$regex: key2}}, {searchString:{$regex: key3}}]}},
        {
            $project:
            {
                student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                group: "$pubInform.group",
                description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                photo: "$pubInform.photo"

            }
        },
        {
            $sort:{student: 1}
        }
        ])
        .limit(5).exec();
    query.then(function(users){
        if(users.length == 0){
            return callback(new dbError(204, 'No users found'));
        }else{
            return callback(null, users);
        }
    });
};


/*
    Поиск по контактам. (по 1-ому, 2-ум или 3-ем ключам)
 */

User.statics.getUserById = function(userId, callback){
    this.findById(userId, function(err, user){
        if(err) return callback(new dbError(err, null, null));
        else{
            if(user) return callback(null, user);
            else return callback(null, false);

        }
    });
};

User.statics.getContactsByOneKey = function (userId, key, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findById(userId, callback);
        },
        function(user, callback){
           if(!user) return callback(new dbError(null, 400, "Incorrect userId"));
            User.aggregate([
                {
                    $match: {"searchString":{$regex: key}, _id: { $in: user.contacts}}
                },
                {
                    $project:
                    {
                        student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                        group: "$pubInform.group",
                        description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                        photo: "$pubInform.photo"
                    }

                },
                {
                    $sort:
                    {
                        student: 1
                    }
                }
                ])
                .limit(5)
                .exec(function(err, users){
                        if(users.length == 0){
                            return callback(new dbError(null, 204, null));
                        }else{
                            return callback(null, users);
                        }
                    });


        }
    ], callback);
};

User.statics.getContactsByTwoKeys = function(userId, key1, key2, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findById(userId, callback);
        },
        function(user, callback){
            if(user){
                 User.aggregate([
                        {
                            $match: {
                                $and:[
                                    {"searchString":{$regex: key1}},
                                    {"searchString": {$regex: key2}}
                                ],
                                _id: { $in: user.contacts}
                            }
                        },
                        {
                            $project:
                            {
                                student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                                group: "$pubInform.group",
                                description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                                photo: "$pubInform.photo"
                            }
                        },
                        {
                            $sort:
                            {
                                student: 1
                            }
                        }
                    ])
                    .limit(5).exec(function(err, users){
                        if(err) return callback(err);
                        if(users.length == 0){
                            return callback(new dbError(null, 204, null));
                        }else{
                            return callback(null, users);
                        }
                    });

            }
        }
    ], callback);
};

User.statics.getContactsByThreeKeys = function(userId, key1, key2, key3, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findById(userId, callback);
        },
        function(user, callback){
            if(user){
                User.aggregate([
                    {
                        $match: {
                            $and:[
                                {"searchString": {$regex: key1}},
                                {"searchString": {$regex: key2}},
                                {"searchString": {$regex: key3}}
                            ],
                            _id: { $in: user.contacts}
                        }
                    },
                    {
                        $project:
                        {
                            student:{$concat:["$pubInform.surname", " ", "$pubInform.name"]},
                            group: "$pubInform.group",
                            description: {$concat:["$pubInform.university",", ","$pubInform.faculty", ", ", "$pubInform.group", " курс"]},
                            photo: "$pubInform.photo"
                        }
                    },
                    {
                        $sort:
                        {
                            student: 1
                        }
                    }
                ])
                    .limit(5).exec(function(err, users){
                        if(err) return callback(err);
                        if(users.length == 0){
                            return callback(new dbError(null, 204, null));
                        }else{
                            return callback(null, users);
                        }
                    });

            }
        }
    ], callback);
};



/*
    Добавление контактов
 */
User.statics.addContacts = function(userId, contacts, callback){
    var User = this;

    async.waterfall([
        function(callback){
           User.findById(userId, function(err, user){
                if(err) return callback(new dbError(err, null, null));
                else{
                    return callback(null, user);
                }
            });
        },
        function(user, callback){
            if(user){
                for(var i = 0; i < contacts.length; i++){
                    if(user.contacts.indexOf(contacts[i]) < 0){
                        user.contacts.push(contacts[i]);
                    }
                }
                user.save(callback)
            }else{
                callback(new dbError(null, 400, 'Не найден юзер по id = ' + userId));
            }
        }
    ],  function(err){
       if(err) {
           if(err instanceof dbError){
               return callback(err);
           }else{
               return callback(new dbError(err, null, null));
           }
       }
       else{
           console.debug('Добавления списка контактом произошло успешно');
           return callback(null, true);
       }
    });
};

/*
    обновление фотографии
 */

User.statics.updatePhoto = function(userId, newPhoto, callback){
    var User = this;
    User.findByIdAndUpdate(userId, {"pubInform.photo": newPhoto}, function(err, result){
        if(result.nModified == 0){
            return callback(new dbError(null, 404, null));
        }
        if(err) return callback(new dbError(err, null, null));
        return callback(null, true);
    })
};



/*
    Заблокировать юзера
 */

User.statics.addContacts = function(userId, blockedUser, callback){
    var User = this;

    async.waterfall([
        function(callback){
            User.findById(userId, function(err, user){
                if(err) return callback(new dbError(err, null, null));
                else{
                    return callback(null, user);
                }
            });
        },
        function(user, callback){
            if(user){
                if(user.privacy.blockedUsers.indexOf(blockedUser) < 0) user.privacy.blockedUsers.push(blockedUser);
                user.save(callback)
            }else{
                callback(new dbError(null, 400, 'Не найден юзер по id = ' + userId));
            }
        }
    ],  function(err){
        if(err) {
            if(err instanceof dbError){
                return callback(err);
            }else{
                return callback(new dbError(err, null, null));
            }
        }
        else{
            console.debug("Юзер с id = " + blockedUser + " добавлен в список заблокированных для юзера с id = " + userId);
            return callback(null, true);
        }
    });
};



// =================================testing
User.statics.removeContacts = function(userId, callback){

   this.getUserById(userId, function(err, user){
        if(user){
            user.contacts = [];
            user.save();
            return callback(null, user);
        }
    })
};


exports.User = mongoose.model('User', User);
