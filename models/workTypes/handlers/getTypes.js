'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Получение активных типов работы по строке. Если строка пустая - возвращаются все

	@param id

	Выход:
	 500 - ошибка бд
	 404 - нет типа работы с таким id
	 workType - все прошло хорошо
 */
module.exports.enabled = function(query){
	let WorkType = this;
	let deffer = Q.defer();
	let promise;
	if(query.length == 0){
		promise = WorkType.find(
			{
				title: {$regex: query},
				enabled: true
			}).exec();
	}else{
		promise = WorkType.find(
			{
				title: {$regex: query},
				enabled: true
			}).limit(10)
			.exec();
	}
	promise.then(function(types){
		if(types.length == 0){
			throw new DbError(null, 204, Util.format('No workTypes found by query "%s"', query));
		}else{
			deffer.fulfill(types);
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

/*
 Получение дизактивированных типов работы по строке. Если строка пустая - возвращаются все

 @param id

 Выход:
 500 - ошибка бд
 404 - нет типа работы с таким id
 workType - все прошло хорошо
 */
module.exports.disabled = function(query){
	let WorkType = this;
	let deffer = Q.defer();
	let promise;
	if(query.length == 0){
		promise = WorkType.find(
			{
				title: {$regex: query},
				enabled: false
			}).exec();
	}else{
		promise = WorkType.find(
			{
				title: {$regex: query},
				enabled: false
			}).limit(10)
			.exec();
	}
	promise.then(function(types){
		if(types.length == 0){
			throw new DbError(null, 204, Util.format('No workTypes found by query "%s"', query));
		}else{
			deffer.fulfill(types);
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


/*
 Получение всех(как активированных, так и неактивированных) типов работы по строке. Если строка пустая - возвращаются все

 @param id

 Выход:
 500 - ошибка бд
 404 - нет типа работы с таким id
 workType - все прошло хорошо
 */
module.exports.all = function(query){
	let WorkType = this;
	let deffer = Q.defer();
	let promise;
	if(query.length == 0){
		promise = WorkType.find(
			{
				title: {$regex: query}
			}).exec();
	}else{
		promise = WorkType.find(
			{
				title: {$regex: query}
			}).limit(10)
			.exec();
	}
	promise.then(function(types){
		if(types.length == 0){
			throw new DbError(null, 204, Util.format('No workTypes found by query "%s"', query));
		}else{
			deffer.fulfill(types);
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