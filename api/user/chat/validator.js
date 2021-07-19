// npm modules
const joi	=	require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');

module.exports = {
	GET_MESSAGE:{
	    skip:joi.number().default(0),
		limit: joi.number().default(20),
		otherPerson: joi.string().length(24).required(),
		lastId: joi.string().length(24).optional().allow(""),
    },
	CHAT_LISTING: {
		skip: joi.number().default(0),
		limit: joi.number().default(20),
		search: joi.string().allow(""),
		chatWith: joi.string().required().valid([APP_CONSTANTS.FEED_LIST_TYPE.VENDOR, APP_CONSTANTS.FEED_LIST_TYPE.USER])
	},
	DELETE_CHAT: {
		otherPerson: joi.string().length(24).required(),
	},
	MUTE_CHAT: {
		otherPerson: joi.string().length(24).required(),
		status: joi.string().valid([APP_CONSTANTS.STATUS_ENUM.MUTE, APP_CONSTANTS.STATUS_ENUM.UNMUTE]).default(APP_CONSTANTS.STATUS_ENUM.MUTE)
	}
};
