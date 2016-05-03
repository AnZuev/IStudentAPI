




exports.put = function(req, res, next){
	console.log(req.headers);
	res.send("true");
	res.end();
	next();
};