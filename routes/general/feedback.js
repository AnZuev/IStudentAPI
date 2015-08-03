var HttpError = require('../../error').HttpError;
var Suggest = require('../../models/suggestions').Suggest;



exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){
        var address = req.body.address;
        var AdditionalInformationAboutSuggestor = req.body.AdditionalInformationAboutSuggestor;
        var idea =  req.body.DescriptionOfSuggestion;
       var suggestion = {
           address: address,
           additional: AdditionalInformationAboutSuggestor,
           idea: idea
       };
       Suggest.addSuggestion(suggestion, function(err){
           if(err) return next(err);
           else return next();
       })



    }
};