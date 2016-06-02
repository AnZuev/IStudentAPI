'use strict';

var Q = require('q');
var DbError = require(appRoot + "/error");

exports.byOneKey = function (userId, key){
	var User = this;
	return Q.async(function *(){
		try{
			var user = yield User.findOne({_id: userId});
			let rawContacts = [];

			user.contacts.forEach(function(item){
				rawContacts.push(item.id);
			});
			rawContacts = yield User.find(
				{
					$or:[
						{"pubInform.name": {$regex: key}},
						{"pubInform.surname": {$regex: key}}
					],
					_id: { $in: rawContacts}
				}
			).exec();


			let contacts = [];
			for(let i = 0; i < rawContacts.length; i++){
				let contact = yield rawContacts[i].makeContact();
				contact.online = yield rawContacts[i].isOnline();
				contacts.push(contact);
			}
			return contacts;
		}catch(err){
			throw new DbError(err, 500);
		}

	})();


};

exports.byTwoKeys = function (userId, key1, key2){
	var User = this;
	return Q.async(function *(){
		try{
			var user = yield User.findOne({_id: userId});
			let rawContacts = [];

			user.contacts.forEach(function(item){
				rawContacts.push(item.id);
			});

			rawContacts = yield User.find(
				{
					$or:[
						{
							$and:[
								{"pubInform.name": {$regex:key1}},
								{"pubInform.surname": {$regex:key2}}
							]
						},
						{
							$and:[
								{"pubInform.name": {$regex:key2}},
								{"pubInform.surname": {$regex:key1}}
							]
						}

					],
					_id: { $in: rawContacts}
				}
			).exec();

			let contacts = [];
			for(let i = 0; i < rawContacts.length; i++){
				let contact = yield rawContacts[i].makeContact();
				contact.online = yield rawContacts[i].isOnline();
				contacts.push(contact);
			}
			return contacts;
		}catch(err){
			throw new DbError(err, 500);
		}

	})();


};



