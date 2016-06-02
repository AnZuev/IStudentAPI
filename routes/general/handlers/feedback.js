var Suggest = require('../../../models/suggestions').Suggest;



exports.post = function(req, res, next){
    if(res.req.header['X-Requested-With'] == 'XMLHttpRequest'){
        var address = req.body.address;
        var topic = req.body.topic;
        var idea =  req.body.idea;

        var suggestion =  new Suggest({
	        address: address,
	        topic: topic,
	        idea: idea
        });
	    Suggest.addSuggestion(suggestion, function(err){
		    if(err) return next(err);
		    else {
			    res.end();
			    next();
		    }
	    });
    }
};