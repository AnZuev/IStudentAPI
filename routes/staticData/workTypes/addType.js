'use strict';
var WorkTypes = require(appRoot + "/models/workTypes").WorkTypes;
var Q = require('q');
var HttpError = require('../../../error/index').HttpError;


exports.post = function(req, res, next){

    Q.async(function*(){
        try{
            let title = req.body.title;
            let workType = yield WorkTypes.add(title, []);
            res.json(workType);
            res.end();
            next();

        }catch(e){
            if (e.code == 500) return next(500);
            next(new HttpError(400, "Such type also exist!"));
        }
    })().done();
};
