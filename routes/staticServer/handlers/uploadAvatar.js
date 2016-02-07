var http = require("http");
var crypto = require('crypto');
var async = require('async');
var fs = require("fs");
var path = require("path");

var config = require('../../../config');
var privateKey = fs.readFileSync(path.join(__dirname, "../../../", config.get('staticServerAuth:privateKey')).toString('ascii'));
var tmpFile = require('../../../models/tmpFilesStorage').tmpFile;

var log = require('../../../libs/log')(module);



exports.post = function(req, res, next){


	async.waterfall([
		function(callback){
			tmpFile.addTmpFile("uploadAvatar", req.session.user, callback);
		},
		function(tmpFile, callback){
			var userId = req.session.user;
			var date = Date.now().toString();
			var data = [tmpFile._id, date, userId];
			data = data.join("/");
			var sign = crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'hex');
			data = data.split("/");
			data.push(sign);
			var options = {
				host: config.get("general:privateStaticServer"),
				port: config.get("general:privateStaticServerPort"),
				path: '/setUploadKey',
				method: 'PUT',
				headers: {"key": data.join('/')}
			};
			var request = http.request(options, function(response){
				return callback(null, response, tmpFile);
			});
			request.end();
		},
		function(response, tmpFile, callback){
			response.on('data', function (chunk) {
				if(JSON.parse(chunk.toString()).exception) res.writeHead(response.statusCode);
				else{
					res.statusCode = response.statusCode;
					res.json(tmpFile._id);
				}
			});
			response.on('end', function () {
				res.end();
				callback(null);
			});
		}
	], function(err){
		if(err) throw err;
		else return next();
	})









};