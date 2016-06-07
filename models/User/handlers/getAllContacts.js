'use strict';

var Q = require('q');


module.exports = function (userId){
	var User = this;
	return Q.async(function *(){
		let user = yield User.findOne({_id: userId}).exec();
		let rawContacts = [];

		user.contacts.forEach(function(item){
			rawContacts.push(item.id);
		});
		rawContacts = yield User.find({_id: { $in: rawContacts}}).exec();

		var contacts = [];
		for(let i = 0; i < rawContacts.length; i++){
			let contact = yield rawContacts[i].makeContact();
			contact.online = yield rawContacts[i].isOnline();
			contacts.push(contact);
		}
		return contacts;
	})();
};