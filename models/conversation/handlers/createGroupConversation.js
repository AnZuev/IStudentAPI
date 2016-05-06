var dbError = require('../../../error/index').dbError;
var async = require('async');

module.exports = function(title, owner, photo, participants, callback){
	var conversation = this;
	var messageItem = {
		etc:{
			mType: "service",
			action: "create",
			actionMember: owner
		}
	};

	var newConv = new conversation({
		participants:participants,
		group:{
			title: title,
			owner: owner,
			photo: photo
		},
		messages:[messageItem]
	});
	newConv.save(function(err, conv){
		if(err) throw err;
		if(err) return callback(new dbError(err,null, null));
		else {
			return callback(null, conv);
		}
	});
};