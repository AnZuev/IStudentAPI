'use strict';
var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
var HttpError = require('../../../error/index').HttpError;

exports.get = function(req, res, next){

    Q.async(function*(){
        try{
            let title;
            if (req.query.title) title = req.query.title;
            else title = "";
            let workType = yield WorkTypes.getEnabled(title);
            res.json(workType);
            res.end();
            next();

        }catch(e){
            if (e.code == 500) return next(500);
            else if(e.code==204) return next(204);
            else return next(400);
        }
    })().done();
};