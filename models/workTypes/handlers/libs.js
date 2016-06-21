'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Проверка существует ли предмет по id,
	@param id


	Выход:
	 500 - ошибка бд
	 false - нет типа работы с таким id
	 true - все прошло хорошо
 */
module.exports.isExist = function(id){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.findById(id).exec();

	promise.then(function(type){
		if(!type){
			deffer.fulfill(false);
		}else{
			deffer.fulfill(true);
		}
	}).catch(function(err){
		return deffer.reject(new DbError(err, 500));
	});
	return deffer.promise;
};