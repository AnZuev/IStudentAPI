'use strict';
global.appRoot = '/Users/anton/WebstormProjects/IStudentAPI';

var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
/*
Q.async(function*(){
	try{
		let workType = yield WorkTypes.add("Лабораторная работа", []);
		console.log(workType);
	}catch(e){
		console.error(e);
	}

})().done();*/

/*Q.async(function*(){
	try{
		let workType = yield WorkTypes.setName("57518fbadbed40cb56dea85b", "Курсовая работа");
		console.log(workType);
	}catch(e){
		console.error(e);
	}

})().done();*/


Q.async(function*(){
	let query = "^" + "";
	query = new RegExp(query, 'ig');
	try{
		let workType = yield WorkTypes.isExist('5751a033e805bb2d59dfbaad');
		console.log(workType);
	}catch(e){
	    console.error(e);
	}
 })().done();

