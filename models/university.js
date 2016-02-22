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
	faculties:[faculty],
	location:{
		city: String,
		street: String,
		building:String
	},
	rating:Number
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
		if(err) return callback(err);
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

	this.findOne({_id: uId, "faculties._id":id} , {title:1}, function(err, res){
		if(err) return callback(err);
		else{
			if(!res) return callback(new dbError(null, 404, util.format("no faculty found by %s", id)));
			else{
				return callback(null, res);
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

/*
 Метод для получения списка факультетов в рамках одного универа по id
 Вход:  id универа
 Выход: либо список факультетов с названием универа, либо ошибка

 */
university.statics.getFaculties = function(id, year, callback){
	this.aggregate([
		{
			$match:{
				_id: id
			},
			$project:{
				faculties: "$faculties.title",
				title: "$title"
			}
		}
	], function(err, facultiesItem){
		if(err) return callback(err);
		else{
			return callback(null, facultiesItem);
		}
	});
};

/*
 Метод для получения списка универов
 Вход:
 Выход: либо ошибка, либо список универов, отсортированный по рейтингу
 */

university.statics.getUniversities = function(callback){
	this.find({}, {$limit: 20}, function(err, universities){
		if(err) return callback(err);
		else{
			return callback(null, universities);
		}

	})
};

/*
 Метод для получения списка универов по названию(используем поиск с помощью regex)
 Вход:
 Выход: либо ошибка, либо список универов, отсортированный по рейтингу
 */
university.statics.getUniversitiesByTitle = function(title, callback){
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
		{
			$project: {
				title: "$title",
				id: "$_id"
			}
		},
		function(err, results){
			if(err || (results.length == 0)){
				return callback(null, []);
			}else{
				return callback(null, results);
			}
		}
	])
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
				_id: university,
				title: {$regex: title}
			}
		},
		{
			$limit: 10
		},
		{
			$sort: {title:1}
		},
		{
			$project: {
				title: "$title",
				id: "$_id"
			}
		}

	], function(err, results){
		if(err || (results.length == 0)){
			return callback(null, []);
		}else{
			return callback(null, results);
		}
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
			faculty: user.faculty
		},
		function(err, universityItem){
			if(err || !universityItem) return callback(err);
			else{
				user.about = util.format("%s, %d, курс, группа %d", universityItem.faculties[0].getFacultyName(), user.year, user.group);
				user.university = universityItem.getUniversityName();
				delete user.faculty;
				delete user.year;
				return user;
			}
		}
	)
};


university.statics.addUniversity = function(title, street, building, city, callback){
	var university = this;
	var newUniversity = new university({
		title: title,
		location:{
			street: street,
			building: building,
			city: city
		}
	});
	newUniversity.save(function(err, university){
		if(err) return callback(err);
		else{
			return callback(null, university);
		}
	})
};

university.statics.addFacultiesToUniversity = function(id,faculties, callback){
	var universities = this;
	async.waterfall([
		function(callback){
			universities.findById(id, callback)
		},
		function(university, callback){
			if(!university) return callback("no university found");
			else {
				university.faculties = faculties;
				university.save(function (err) {
					if (err) return callback(err);
					else {
						return callback(null, true)
					}
				})
			}
		}
	],
		function(err, result){
			if(err ){
				return callback(null, false);
			}else{
				if(result) return callback(null, result);

			}
		})
};


exports.university = mongoose.model('university', university);
exports.faculty = mongoose.model('faculty', faculty);




