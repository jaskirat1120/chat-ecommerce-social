// npm modules
const joi = require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');
module.exports = {
    ADD_FEED: {
        feedId: joi.string().length(24),
        caption: joi.string().description("Caption text for feed"),
        hashTag: joi.array().items(
            joi.string().description('["#video","#hashTag"]')
        ),
        media: UniversalFunctions.mediaAuth,
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO).description("Type of media"),
        privacyType: joi.string().valid([APP_CONSTANTS.PRIVACY_TYPE.PUBLIC, APP_CONSTANTS.PRIVACY_TYPE.PRIVATE, APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE]).default(APP_CONSTANTS.PRIVACY_TYPE.PUBLIC).description("Type of Privacy"),
        productId: joi.string().length(24).allow(""),
        postId: joi.string().length(24).allow(""),
        vendorId: joi.string().length(24).allow(""),
        selectedId: joi.array().items(joi.string().length(24)),
        taggedVendors: joi.array().items(joi.string().length(24)),
        type: joi.string().valid([APP_CONSTANTS.FEED_TYPE.SHARE_PRODUCT, APP_CONSTANTS.FEED_TYPE.SHARE_POST, APP_CONSTANTS.FEED_TYPE.SHARE_VENDOR]).allow("")
    },
    LIST_FEED: {
        skip: joi.number().optional().description("start with 0"),
        limit: joi.number().optional().description("start with 10"),
        user: joi.string().length(24).optional(),
        hashTag: joi.array().items(
            joi.string()).description('["#video","#hashTag"]'),
        type: joi.string().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]),
        section: joi.string().valid([APP_CONSTANTS.SECTION.PROFILE, APP_CONSTANTS.SECTION.HOME])
    },
    
    LIST_FEED_DETAILS: {
        feedId: joi.string().length(24).required(),
    },
    ADD_COMMENT: {
        commentId: joi.string().optional().length(24).description("_id of particular comment"),
        feed: joi.string().required().length(24).description("_id of particular Feed"),
        text: joi.string().required().description("Comment text"),
    },
    DELETE_COMMENT: {
        commentId: joi.string().required().length(24).description("_id of particular comment"),
    },
    LIKE_UNLIKE_FEED: {
        feed: joi.string().required().length(24).description("_id of particular Feed"),
        status: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.LIKE, APP_CONSTANTS.STATUS_ENUM.UNLIKE])
    },
    // FAVOURITE_UNFAVOURITE_FEED:{
    //     feed: joi.string().required().length(24).description("_id of particular Feed"),
    //     status: joi.string().required().valid([APP_CONSTANTS.STATUS_ENUM.FAVOURITE,APP_CONSTANTS.STATUS_ENUM.UNFAVOURITE])
    // },
    // SHARE_FEED:{
    //     feed: joi.string().required().length(24).description("_id of particular Feed"),
    // },
    LIST_LIKES: {
        feed: joi.string().required().length(24).description("_id of particular Feed"),
        skip: joi.number().description("start with 0"),
        limit: joi.number().description("start with 20"),
    },
    LIST_COMMENTS: {
        feed: joi.string().required().length(24).description("_id of particular Feed"),
        skip: joi.number().description("start with 0"),
        limit: joi.number().description("start with 20")
    },
    DELETE_FEED: {
        feed: joi.string().length(24).required()
    },
    REPORT_FEED: {
        feed: joi.string().length(24).required(),
        reason: joi.string().allow("")
    },
    HIDE_FEED: {
        feed: joi.string().length(24).required(),
        status: joi.string().valid([APP_CONSTANTS.STATUS_ENUM.HIDE, APP_CONSTANTS.STATUS_ENUM.UNHIDE]).default(APP_CONSTANTS.STATUS_ENUM.HIDE)
    }
};
