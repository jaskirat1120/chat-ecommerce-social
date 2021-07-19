// npm modules
const joi	=	require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');
module.exports = {
    FOLLOW_UNFOLLOW : {
        receiver: joi.string().length(24).required(),
        action: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.FOLLOW,APP_CONSTANTS.STATUS_ENUM.UNFOLLOW]),
        followType: joi.string().required().valid([APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR,APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER]),
    },
    LIST_FOLLOWING : {
        skip: joi.number(),
        limit: joi.number(),
        searchHashTag: joi.string().allow(""),
        type: joi.string().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR])
    },
    LIST_FOLLOWERS : {
        skip: joi.number(),
        limit: joi.number(),
        search: joi.string().allow("")
    },
    ACCEPT_REJECT_REQUEST : {
        _id: joi.string().length(24).required(),
        action: joi.string().required().valid([
            APP_CONSTANTS.FOLLOW_ACTION.ACCEPT,
            APP_CONSTANTS.FOLLOW_ACTION.REJECT,
        ])
    }
};
