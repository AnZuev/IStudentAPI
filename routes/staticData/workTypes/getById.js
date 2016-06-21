'use strict';
var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
var HttpError = require('../../../error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.get = function(req, res, next){

    Q.async(function*(){
        try{
            let id = mongoose.Types.ObjectId(req.query.id);
            let workType = yield WorkTypes.getById(id);
            res.json(workType);
            res.end();
            next();

        }catch(e){
            if (e.code == 500) return next(500);
            else if (e.code == 404) return next(new HttpError(404, "There is no such type"));
            else return next(new HttpError(400,e.message));
        }
    })().done();
};