'use strict';
var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
var HttpError = require('../../../error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.get = function(req, res, next){

    Q.async(function*(){
        try{
            let id = mongoose.Types.ObjectId(req.query.id);
            let workType = yield WorkTypes.isExist(id);
            res.json(workType);
            res.end();
            next();

        }catch(e){
            if (e.code == 500) return next(500);
            else return next(400);
        }
    })().done();
};