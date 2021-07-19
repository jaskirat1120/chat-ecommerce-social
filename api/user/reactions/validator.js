// npm modules
const joi	=	require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');
module.exports = {
    LIKE_UNLIKE_PRODUCT:{
        product: joi.string().required().length(24).description("_id of particular Product"),
        status: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.LIKE,APP_CONSTANTS.STATUS_ENUM.UNLIKE])
    },
    LIKE_UNLIKE_VENDOR:{
        vendor: joi.string().required().length(24).description("_id of particular vendor"),
        status: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.LIKE,APP_CONSTANTS.STATUS_ENUM.UNLIKE])
    },
    FAVOURITE_UNFAVOURITE_PRODUCT:{
        product: joi.string().required().length(24).description("_id of particular Product"),
        status: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.FAVOURITE,APP_CONSTANTS.STATUS_ENUM.UNFAVOURITE])
    },
    SHARE_PRODUCT:{
        product: joi.string().required().length(24).description("_id of particular Product"),
    },
    LIST_FAVOURITE_PRODUCT:{
        skip: joi.number().default(0).optional().description("start with 0"),
        limit: joi.number().default(10).optional().description("start with 10"),
    }
};
