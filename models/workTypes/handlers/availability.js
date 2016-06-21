'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Активация работы по id,
	@param id


	Выход:
	 500 - ошибка бд
	 404 - нет типа работы с таким id
	 workType - все прошло хорошо
 */
exports.enable = function(id){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.findById(id).exec();

	promise.then(function(type){
		if(!type){
			throw new DbError(null, 404, Util.format('WorkType with id "%s" does not exist', id));
		}else{
			type.enabled = true;
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
		}else{
			return deffer.reject(new DbError(err, 500));
		}
	});
	return deffer.promise;
};


/*
 Дизактивация работы по id,
 @param id


 Выход:
 500 - ошибка бд
 404 - нет типа работы с таким id
 workType - все прошло хорошо
 */
exports.disable = function(id){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.findById(id).exec();

	promise.then(function(type){
		if(!type){
			throw new DbError(null, 404, Util.format('WorkType with id "%s" does not exist', id));
		}else{
			type.enabled = false;
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
		}else{
			return deffer.reject(new DbError(err, 500));
		}
	});
	return deffer.promise;
};