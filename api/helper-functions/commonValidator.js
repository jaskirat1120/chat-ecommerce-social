// npm modules
const joi = require('joi');
const APP_CONSTANTS = require('../../config/constants/app-defaults');
const UniversalFunctions = require('../../utils/universal-functions')

module.exports = {
    UPLOAD_FILE: {
        vendorId: joi.string().allow(""),
        type: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO, APP_CONSTANTS.MEDIA_TYPE_ENUM.AUDIO]),
        file: joi.any()
            .meta({swaggerType: 'file'})
            .description('Select Image or video')
            .required()
    },
    SOCKET_CONNECTION: {
        EIO: joi.any(),
        transport: joi.any(),
        t: joi.any(),
        b64: joi.any(),
        accessToken: joi.string().required(),
        deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB]),
        userType: joi.string().required().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR])
    },
    MESSAGE_AUTH: {
        // conversationId: joi.string().optional().length(24).allow(""),
        receiver: joi.string().required().length(24),
        sender: joi.string().length(24),
        senderUserType: joi.string().required().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]),
        receiverUserType: joi.string().required().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]),
        message: joi.string().allow(""),
        messageType: joi.string().valid([
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.TEXT,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.AUDIO,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.IMAGE,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.VIDEO,
        ]).required().default(APP_CONSTANTS.DATABASE.MESSAGE_TYPE.TEXT),
        fileUrl: UniversalFunctions.mediaAuth,
    },
    CREATE_RATING: {
        order: joi.string().length(24).optional(),
        vendor: joi.string().length(24).optional(),
        product: joi.string().length(24).optional(),
        type: joi.string().optional().valid([
            APP_CONSTANTS.RATING_TYPE.VENDOR_RATING,
            APP_CONSTANTS.RATING_TYPE.PRODUCT_RATING,
            APP_CONSTANTS.RATING_TYPE.ORDER_RATING
        ]).default(APP_CONSTANTS.RATING_TYPE.ORDER_RATING),
        ratings: joi.number().required(),
        comments: joi.string().optional().allow('')
    },
    DEVICE_TOKEN: {
        vendorId: joi.string().length(24).allow(""),
        deviceToken: joi.string().required()
    },
    
    CONTACT_US: {
        title: joi.string().optional().allow(""),
        reason: joi.string().optional().allow(""),
        type: joi.string().valid([APP_CONSTANTS.REPORT_TYPE.CONTACT_US, APP_CONSTANTS.REPORT_TYPE.ISSUE]),
        media: UniversalFunctions.mediaAuth,
    },
    USER_DETAILS: {
        id: joi.string().required(),
        type: joi.string().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]).required()
    }
};
