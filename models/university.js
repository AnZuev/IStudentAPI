var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var util = require('util');
var async = require('async');


var dbError = require('../error').dbError;


var faculty = new Schema({
	title: {
		type: String
	},
	groups:[
		{
			number:{
				type: String
			},
			year:{
				type: Number
			}
		}
	]
});

var university = new Schema({
	title: {
		type: String,
		unique: true
	},
	shortTitle:{
		type: String,
		unique: true
	},
	faculties:[faculty],
	location:{
		city: String,
		street: String,
		building:String
	},
	rating: Number
});


/*
	Метод для получения имени универа
	Вход:
	Выход: название

 */
university.methods.getUniversityName = function(){
	return this.title;
};
university.statics.getUniversityName = function(id, callback){
	this.findById(id, {title:1}, function(err, res){
		if(err) return callback(new dbError(err));
		else{
			if(!res) return new dbError(null, 404, util.format("no university found by %s", id));
			else{
				return callback(null, res);
			}
		}

	})
};
/*
 Метод для получения имени факультета
 Вход:
 Выход: название

 */
faculty.methods.getFacultyName = function(){
	return this.title;
};

university.statics.getFacultyName = function(uId, id, callback){

	this.findOne({_id: uId, "faculties._id":id} , {"faculties.$":1}, function(err, res){
		if(err) return callback(new dbError(err));
		else{
			if(!res) return callback(new dbError(null, 404, util.format("no faculty found by %s", id)));
			else{
				return callback(null, res.faculties[0]);
			}
		}

	})
};



/*
 Метод для получения списка групп в рамках одного факультета по id
 Вход:  id факультета, год обучения(курс)
 Выход: либо список групп с названием факультета и с id, либо ошибка

 */
faculty.statics.getGroups = function(id, year, callback){
	this.aggregate([
		{
			$match:{
				_id: id,
				"groups.year": year
			},
			$project:{
				groups: "$groups",
				title: "$title"
			}
		}
	], function(err, groupsItem){
		if(err) return callback(err);
		else{
			return callback(null, groupsItem);
		}
	});
};

/*2
 Метод для получения списка факультетов в рамках одного универа по id
 Вход:  id универа
 Выход: либо список факультетов с названием универа, либо ошибка

 */
university.statics.getFaculties = function(university, callback){
	this.aggregate([
		{
			$match: {
				_id: mongoose.Types.ObjectId(university)
			}
		},
		{
			$limit: 10
		},
		{
			$sort: {title:1}
		},
		{
			$project:{
				faculties: "$faculties",
				_id: 0
			}
		}
	], function(err, facultiesItem){
		if(err) return callback(err);
		else{
			if(facultiesItem.length == 0) return callback(null, []);
			facultiesItem = facultiesItem[0];
			facultiesItem.faculties.forEach(function(element){
				delete element.groups;
				element.id = element._id;
				delete element._id;
			});
			return callback(null, facultiesItem.faculties);
		}
	});
};

/*
 Метод для получения списка универов
 Вход:
 Выход: либо ошибка, либо список универов, отсортированный по рейтингу
 */

university.statics.getUniversities = function(format, callback){
	var project = {};
	if(format){
		project = {
			$project: {
				title: "$shortTitle",
				id: "$_id",
				_id:0
			}
		}
	}else{
		project = {
			$project: {
				title: "$title",
				id: "$_id",
				_id:0
			}
		}
	}
	this.aggregate([
		{
			$limit: 20
		},
		{
			$sort: {rating:1}
		},
		project
		],
		function(err, results){
			if(err || (results.length == 0)){
				return callback(null, []);
			}else{
				return callback(null, results);
			}
		}
	);

};

/*
 Метод для получения списка универов по названию(используем поиск с помощью regex)
 Вход: title, format
 Выход: либо ошибка, либо список универов, отсортированный по рейтингу
 */
university.statics.getUniversitiesByTitle = function(title, format, callback){
	var project = {};
	if(format){
		project = {
			$project: {
				title: "$shortTitle",
				id: "$_id",
				_id:0
			}
		}
	}else{
		project = {
			$project: {
				title: "$title",
				id: "$_id",
				_id:0
			}
		}
	}
	this.aggregate([
		{
			$match: {
				title: {$regex: title}
			}
		},
		{
			$limit: 10
		},
		{
			$sort: {rating:1}
		},
		project
		],
		function(err, results){
			if(err || (results.length == 0)){
				return callback(null, []);
			}else{
				return callback(null, results);
			}
		}
	)
};

/*
 Метод для получения списка факультетов в универе по названию (используем поиск с помощью regex)
 Вход:
 Выход: либо ошибка, либо список факультетов
 */
university.statics.getFacultiesByTitle = function(title, university, callback){
	this.aggregate([
		{
			$match: {
				_id: mongoose.Types.ObjectId(university),
				"faculties.title": {$regex: title}
			}
		},
		{
			$limit: 10
		},
		{
			$sort: {title:1}
		},
		{
			$project:{
				faculties: "$faculties",
				id: "$_id",
				_id: 0
			}
		}

	], function(err, facultiesItem){
		if(err) return callback(err);
		if(facultiesItem.length == 0) return callback(null, []);
		facultiesItem = facultiesItem[0];
		facultiesItem.faculties.forEach(function(element){
			delete element.groups;
			element.id = element._id;
			delete element._id;
		});
		return callback(null, facultiesItem);
	})
};

/*
 Метод для обогащения юзера данными об универе
 Вход: пользователь
 Выход: либо ошибка, либо обогащенный юзер
 */

university.statics.validateUI = function(university, faculty, callback){
	this.findOne({
		_id: university,
		"faculties._id": faculty
	}, function(err, res){
		if(err || !res) return callback(null, false);
		else return callback(null, true);
	})
};

university.statics.makeContact = function(user, callback){
	this.findOne(
		{
			_id: user.university,
			"faculties._id": user.faculty
		},
		{
			"faculties.$":1,
			title:1
		},
		function(err, universityItem){
			if(err || !universityItem) return callback(err);
			else{
				user.about = util.format("%s, %d курс", universityItem.faculties[0].title, user.year);
				user.university = universityItem.getUniversityName();
				delete user.faculty;
				delete user.year;
				return callback(null,user);
			}
		}
	)
};

university.statics.fillUniversityNameAndFacultyNameforUser = function(user, callback){
	this.findOne(
		{
			_id: user.university,
			"faculties._id": user.faculty
		},
		{
			"faculties.$":1,
			title:1
		},
		function(err, universityItem){
			if(err || !universityItem) return callback(err);
			else{
				user.faculty = universityItem.faculties[0].title;
				user.university = universityItem.getUniversityName();
				delete user.faculty;
				delete user.year;
				return callback(null,user);
			}
		}
	)
}

university.statics.addUniversity = function(title, shortTitle, street, building, city, rating, callback){
	var university = this;
	var newUniversity = new university({
		title: title,
		shortTitle: shortTitle,
		location:{
			street: street,
			building: building,
			city: city
		},
		rating: rating
	});
	newUniversity.save(function(err, university){
		if(err) return callback(err);
		else{
			var universityToReturn = {
				title: university.title,
				id: university._id
			};
			return callback(null, universityToReturn);
		}
	})
};

university.statics.addFacultiesToUniversity = function(id, faculties, callback){
	var universities = this;
	universities.findOneAndUpdate({_id:id}, {$push : { faculties: {$each: faculties}}}, function(err, university){
		if(err) return callback(err);
		if(!university) return callback("No university found");
		else {
			return callback(null, true);
		}
	});


};


exports.university = mongoose.model('university', university);
exports.faculty = mongoose.model('faculty', faculty);

exports.taskToMakeContact = makeContact;
function makeContact(user){
	 return function(callback){
		exports.university.makeContact(user, callback);
	}
}


