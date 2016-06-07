'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Изменение title у типа работы,
	@param id
	@param newTitle

	Выход:
	 500 - ошибка бд
	 404 - нет типа работы с таким id
	 400 - нарушения уникальности названия
	 workType - все прошло хорошо
 */
module.exports = function(id, newTitle){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.findOne({_id: id}).exec();

	promise.then(function(type){
		if(!type){
			throw new DbError(null, 404, Util.format('WorkType with id "%s" does not exist', id));
		}else{
			type.title = newTitle;
			type.updated = new Date();
			return type.save();
		}
	}).then(function(workType){
		let workTypeToReturn = {
			id: workType._id,
			title: workType.title,
			enabled: workType.enabled
		};
		return deffer.fulfill(workTypeToReturn);
	}).catch(function(err){
		if(err instanceof DbError){
			return deffer.reject(err);
		}else if(err.code == 11000 || err.code == 11001) {
			return deffer.reject(new DbError(null, 400, Util.format('WorkType with title "%s" already exists', newTitle)));
		}else{
			return deffer.reject(new DbError(err, 500));
		}
	});
	return deffer.promise;
};