var mongoose = require(appRoot + '/libs/mongoose'),
	Schema = mongoose.Schema,
	Util = require('util');


var WorkType = new Schema({
	title: {
		type: String,
		unique: true
	},
	created: {
		type: Date,
		default: Date.now()
	},
	updated: {
		type: Date,
		default: Date.now()
	},
	enabled: {
		type: Boolean,
		default: false
	},
	tags:[String]
});


WorkType.statics.add = require('./handlers/add');


WorkType.statics.setName = require('./handlers/setName');

WorkType.statics.enable = require('./handlers/availability').enable;

WorkType.statics.disable = require('./handlers/availability').disable;


WorkType.statics.getById = require('./handlers/getById');

WorkType.statics.getNameById = require('./handlers/getNameById').statics;



WorkType.statics.getEnabled = require('./handlers/getTypes').enabled;

WorkType.statics.getAll = require('./handlers/getTypes').all;

WorkType.statics.getDisabled = require('./handlers/getTypes').disabled;



WorkType.statics.isExist = require('./handlers/libs').isExist;


exports.WorkTypes = mongoose.model('WorkType', WorkType);
