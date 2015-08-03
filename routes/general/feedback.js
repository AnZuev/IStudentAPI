var HttpError = require('../../error').HttpError;
var Suggest = require('../../models/suggestions').Suggest;



exports.post = function(req, res, next){
    if(res.req.header['x-requested-with'] !== 'XMLHttpRequest'){

        var address = req.body.address;
        var AdditionalInformationAboutSuggestor = req.body.AdditionalInformationAboutSuggestor;
        var idea =  req.body.DescriptionOfSuggestion;
        if(address == '' || idea == '') {
            return next(400);
        }
        else{
            console.log(idea + ' ' + address + " " + AdditionalInformationAboutSuggestor + "запрос получил");

            var suggestion =  new Suggest({
                address: address,
                additional: AdditionalInformationAboutSuggestor,
                idea: idea
            });
            Suggest.addSuggestion(suggestion, function(err){
                if(err) return next(err);
                else return next();
            })
        }





    }
};