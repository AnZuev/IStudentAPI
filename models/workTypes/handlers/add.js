'use strict';
var Q = require('q');
var DbError = require(appRoot + '/error').dbError;
var Util = require('util');


/*
	Добавление типа работы,
	@param title
	@param tags

	Выход:
	 500 - ошибка бд
	 400 - нарушения уникальности названия
	 workType - все прошло хорошо
 */
module.exports = function(title, tags){
	let WorkType = this;
	let deffer = Q.defer();
	let promise = WorkType.find({title: title}).exec();

	promise.then(function(types){
		if(types.length > 0){
			throw new DbError(null, 400, Util.format('WorkType with title "%s" already exists', title));
		}else{
			let workType = new WorkType({
				title: title,
				tags: tags
			});
			return workType.save();
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