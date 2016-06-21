'use strict';
var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
var HttpError = require('../../../error/index').HttpError;
var mongoose = require(appRoot+"/libs/mongoose");

exports.post = function(req, res, next){

    Q.async(function*(){
        try{
            let id = mongoose.Types.ObjectId(req.body.id);
            let newTitle = req.body.newTitle;
            let workType = yield WorkTypes.setName(id,newTitle);
            res.json(workType);
            res.end();
            next();

        }catch(e){
            if (e.code == 500) return next(500);
            else if (e.code == 404) return next(new HttpError(404, "There is no such type"));
            else return next(new HttpError(400, e.message));
        }
    })().done();
};