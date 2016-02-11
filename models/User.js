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

    contacts:[{
	    id:Schema.Types.ObjectId,
	    updated: {
		    type:Date,
		    default:Date.now()
	    },
	    _id:0
    }],

    projects:[{}],

	settings:{
		im:[
			{
				convId: Schema.Types.ObjectId,
				notification: Boolean,
				tag:{
					title:String,
					color: String
				},
				_id:0
			}
		]
	},

    searchString:{
        type:String,
        require: true,

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
                    callback(new dbError(err, null, null));
                }
            }
            else{
                callback(null, user);
            }
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

	this.aggregate([
        { $limit : 5 },
        {
            $match: {
	            "searchString": {$regex: key}
            }
        },
        {
	        $project:
	        {
		        username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
		        group: "$pubInform.group",
		        university: "$pubInform.university",
		        faculty: "$pubInform.faculty",
		        photo: "$pubInform.photo",
		        year: "$pubInform.year"
	        }
        },
        {
            $sort:{"username":1}
        }
    ], function(err, users){
		console.log(arguments);
        if(err) throw err;
        if(users.length == 0){
            return callback(new dbError(null, 204, null));
        }else{
            return callback(null, users);
        }
    });
};

User.statics.getPeopleByTwoKeys = function(key1, key2, callback){
	this.aggregate([
		{ $limit : 5 },
		{
			$match: {
				$and:[
					{"searchString":{$regex: key1}},
					{"searchString":{$regex: key2}}
				]}
		},
		{
			$project:
			{
				username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
				group: "$pubInform.group",
				university: "$pubInform.university",
				faculty: "$pubInform.faculty",
				photo: "$pubInform.photo",
				year: "$pubInform.year"
			}
		},
		{
			$sort:{"username":1}
		}
	], function(err, users){
		if(err) throw err;
		if(users.length == 0){
			return callback(new dbError(null, 204, null));
		}else{
			return callback(null, users);
		}
	});
};

User.statics.getPeopleByThreeKeys = function(key1, key2, key3, callback){
    this.aggregate([
        { $limit : 5 },
        {
            $match: {
                $and:[
                    {"searchString":{$regex: key1}},
                    {"searchString":{$regex: key2}},
	                {"searchString":{$regex: key3}}
                ]}
        },
        {
	        $project:
	        {
		        username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
		        group: "$pubInform.group",
		        university: "$pubInform.university",
		        faculty: "$pubInform.faculty",
		        photo: "$pubInform.photo",
		        year: "$pubInform.year"
	        }
        },
        {
	        $sort:{"username":1}
        }
    ], function(err, users){
        if(err) throw err;
        if(users.length == 0){
            return callback(new dbError(null, 204, null));
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
	        User.findOne({_id:userId}, callback);
        },
        function(user, callback){
           if(!user) return callback(new dbError(null, 400, "Incorrect userId"));
			else{
	           var contacts = [];
	           user.contacts.forEach(function(item){
		           contacts.push(item.id);
	           })
           }
            User.aggregate([
                { $limit : 5 },
                {
                    $match:
                    {
                        "searchString":{$regex: key}, _id: { $in: contacts}
                    }
                },
                {
                    $project:
                    {
                        username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
                        group: "$pubInform.group",
	                    university: "$pubInform.university",
	                    faculty: "$pubInform.faculty",
                        photo: "$pubInform.photo",
	                    year: "$pubInform.year"
                    }
                },
                {
                    $sort:{"contacts.updated":1}
                }
            ], function(err, users){
	            if(err) throw err;
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
		            { $limit : 5 },
		            {
			            $match: {
				            $and:[
					            {"searchString":{$regex: key1}},
					            {"searchString": {$regex: key2}}
				            ],
				            _id: { $in: user.contacts.id}
			            }
		            },
		            {
			            $project:
			            {
				            username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
				            group: "$pubInform.group",
				            university: "$pubInform.university",
				            faculty: "$pubInform.faculty",
				            photo: "$pubInform.photo",
				            year: "$pubInform.year"
			            }
		            },
		            {
                        $sort:{"contacts.updated":1}
		            }
	            ], function(err, users){
		            if(err) throw err;
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
		            { $limit : 5 },
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
				            username:{$concat:["$pubInform.name", " ", "$pubInform.surname"]},
				            group: "$pubInform.group",
				            university: "$pubInform.university",
				            faculty: "$pubInform.faculty",
				            photo: "$pubInform.photo",
				            year: "$pubInform.year"
			            }
		            },
		            {
			            $sort:{"contacts.updated":1}
		            }
	            ], function(err, users){
		            if(err) throw err;
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
User.statics.addContacts = function(userId, contact, callback){
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
	            var tmp = false;
                for(var i = 0; i < user.contacts.length; i++){
                    if(user.contacts[i].id.toString() == contact.toString()){
	                    user.contacts[i].updated = Date.now();
	                    tmp = true;
                       break;
                    }
                }
	            if(!tmp) user.contacts.push({id: contact});
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

User.statics.blockContacts = function(userId, blockedUser, callback){
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

/*

	Забрать настройки для конкретной беседы для конкретного юзера
 */

User.statics.getImSettingsByUserAndConvId = function(userId, convId, callback){
	this.findOne(
		{
			_id: userId,
			"settings.im.convId": convId
		},
		{
			"settings.im.$":1,
			_id:0
		},
		function(err, result){
			if(err) {

                //TODO сделать глобальный логгер ошибок в файл
                return callback(null, null);
            }
			else{
				try{
					return callback(null, result.settings.im[0]);
				}catch(e){
					return callback(null, null);
				}

			}
		}
	)
};


/*
	Добавить/обновить настройки для конкретной беседы конкретного юзера

 */
User.statics.addImSettings = function(userId, convId, settings, callback){
	var User = this;
	async.waterfall([
		function(callback){
			User.findOne(
				{
					_id: userId,
					"settings.im.convId": convId
				},
				{
					"settings.im": 1,
					_id:0
				},
				callback
			)
		},
		function(setItemRaw, callback){
            var setItem = setItemRaw.settings.im[0];
			if(setItem){
                for( var key in settings){
                    if(key.toString() == "tag"){
                        if(setItem.tag.title != settings.tag.title && settings.tag.hasOwnProperty("title")) setItem.tag.title = settings.tag.title;
                        if(setItem.tag.color != settings.tag.color && settings.tag.hasOwnProperty("color")) setItem.tag.color = settings.tag.color;
                    }
                    else if(setItem[key] != settings[key]) {
                        setItem[key] = settings[key];
                    }
                }
                User.update(
                    {
                        _id: userId,
                        "settings.im.convId": convId

                    },
                    {
                        $set: {
                            "settings.im.$.tag.title": setItem.tag.title,
                            "settings.im.$.tag.color": setItem.tag.color,
                            "settings.im.$.notification": setItem.notification
                        }
                    },
                    callback
                )
			}else{
				User.update(
					{
						_id: userId
					},
					{
						$push:{
							"settings.im": settings
						}
					},
					callback
				)
			}
		}
	], function(err){
		if(err) return callback(new dbError(err, 500, null));
        return callback(null, true);
	})
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


User.statics.removeSettings = function(userId, callback){
	this.remove(
		{
			_id: userId
		},
		callback
	)
}


exports.User = mongoose.model('User', User);




