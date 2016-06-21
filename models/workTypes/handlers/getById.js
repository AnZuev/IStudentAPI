'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Получение типа работы по id,
	@param id


	Выход:
	 500 - ошибка бд
	 404 - нет типа работы с таким id
	 workType - все прошло хорошо
 */
module.exports = function(id){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.findById(id).exec();

	promise.then(function(type){
		if(!type){
			throw new DbError(null, 404, Util.format('WorkType with id "%s" does not exist', id));
		}else{
			deffer.fulfill(type);
		}
	}).catch(function(err){
		if(err instanceof DbError){
			return deffer.reject(err);
		}else{
			return deffer.reject(new DbError(err, 500));
		}
	});
	return deffer.promise;
};