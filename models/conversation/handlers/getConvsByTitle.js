'use strict';
var mongoose = require('mongoose'),
	Q = require('q');

module.exports = function(title, userId){
	var deffer = Q.defer();
	this.aggregate([
		{
			$match:
			{
				"group.title": {$regex: title},
				"participants": mongoose.Types.ObjectId(userId)
			}
		},
		{
			$project:
			{
				title: "$group.title",
				photo: "$group.photo",
				type: {$concat:["group"]},
				lastMessage: {$slice: ["$messages", -1]}
			}
		},
		{
			$unwind: "$lastMessage"
		},
		{
			$project:
			{
				title: "$title",
				photo: "$photo",
				type: "$type",
				lastMessage: "$lastMessage.text"
			}
		},
		{ $limit : 15 },
		{
			$sort:{updated:1}
		}
	], function(err, conversations){
		if(err) deffer.reject(err);
		else{
			return deffer.fulfill(conversations);
		}
	});
	return deffer.promise;
};