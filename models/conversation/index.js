var mongoose = require('../../libs/mongoose'),
    Schema = mongoose.Schema;


require('../../libs/additionalFunctions/extensionsForBasicTypes');


var Message = new Schema({
    text: {
        type:String,
	    require: false
    },
    sender: {
        type:Schema.Types.ObjectId,
	    require: false
    },
    date:{
        type: Date,
        default: Date.now()
    },
    unread:[Schema.Types.ObjectId],
    etc: {
	    mType: String,
	    action: String,
	    actionMember: Schema.Types.ObjectId
    },
    attachments: {
        type: {
            type: String,
	        require: true
        },
        name: {
            type: String,
	        require: true
        },
        content: {}
    }

}, {_id: 0});

var conversation = new Schema({
    participants:[Schema.Types.ObjectId],
    group:{
        title: String,
        photo: String,
        owner: Schema.Types.ObjectId
    },
    messages:[Message],
    updated: {
	    type:Date,
	    default:Date.now()
    }
});





/*
* Создание личного диалога между 2 людьми
*/
conversation.statics.createPrivateConversation = require('./handlers/createPrivateConversation');

/*
 * Создание группового диалога между 3 и более людей
 */
conversation.statics.createGroupConversation = require('./handlers/createGroupConversation');



conversation.statics.addMessage = require('./handlers/addMessage');



conversation.statics.removeParticipants = require('./handlers/removeParticipants');

conversation.statics.addParticipants = require('./handlers/addParticipants');

conversation.statics.readMessages = require('./handlers/readMessages');

conversation.statics.getMessages = require('./handlers/getMessages');

conversation.statics.getConvsByTitle = require('./handlers/getConvsByTitle');

conversation.statics.getConvById = require('./handlers/getConvById');

conversation.statics.getPrivateConvByParticipants = require('./handlers/getPrivateConvsByParticipants');

conversation.statics.getLastConversations = require('./handlers/getLastConversations');

conversation.statics.getUnreadMessagesForUser = require('./handlers/getUnreadMessagesForUser');


exports.conversation = mongoose.model('conversation', conversation);


exports.message = mongoose.model('message', Message);


