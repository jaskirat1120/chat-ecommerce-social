// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    LIST_CATEGORIES: {
        vendorId: joi.string().length(24).allow(""),
        type: joi.string().valid([APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES]).required().default(APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        vendorId: joi.string().length(24),
        parentId: joi.array().items(joi.string().length(24))
    },
    LIST_COLLECTIONS: {
        vendorId: joi.string().length(24).allow(""),
        type: joi.string().valid([APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS]).required().default(APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS),
        skip: joi.number().optional(),
        limit: joi.number().optional()
    },
    LIST_COMMON_SERVICE: {
        vendorId: joi.string().length(24).allow(""),
        type: joi.string().valid([APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE, 
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COURIER_SERVICE, 
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COVERAGE_AREA,
             APP_CONSTANTS.COMMON_SERVICES_TYPE.SIZES,
              APP_CONSTANTS.COMMON_SERVICES_TYPE.COLORS,
               APP_CONSTANTS.COMMON_SERVICES_TYPE.COUNTRY,
                APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER,
                 APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON,
                 APP_CONSTANTS.COMMON_SERVICES_TYPE.PROCESSING_TIME,]).required().default(APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        parentId: joi.string().length(24)
    },
    LIST_PLANS: {
        vendorId: joi.string(),
        type: joi.string().valid([APP_CONSTANTS.PLAN_TYPE.NORMAL, APP_CONSTANTS.PLAN_TYPE.PLUS_CARD, APP_CONSTANTS.PLAN_TYPE.ELITE_AD, APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER, APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE]),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    ADD_CATEGORY: {
        vendorId: joi.string().length(24).allow(""),
        name: joi.object().description("{en:'Accessories',ar:'Accessories'}"),
        description: joi.object().description("{en:'Accessories',ar:'Accessories'}"),
        rank: joi.number(),
        media: joi.array().items(UniversalFunctions.mediaAuth),
        type: joi.string().default(APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES),
        parentId: joi.array().items(joi.string().length(24)),
    },
    SELECT_PLAN: {
        vendorId: joi.string().length(24).allow(""),
        planId: joi.string().length(24).required(),
        durationType: joi.string().valid([APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR, APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH]),
        transactionId: joi.string().optional(),
        media: UniversalFunctions.mediaAuth,
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE).description("Type of media"),
        name: joi.object(),
        description: joi.object(),
        startDate: joi.number(),
        discountOffer: joi.string().length(24).optional().allow(""),
        subscriptionLogId: joi.string().length(24).optional().allow(""),
    },
    DOWNGRADE_REQUEST: {
        vendorId: joi.string().allow(""),
        currentPlan: joi.string().required().length(24),
        durationType: joi.string().valid([APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR, APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH]),
        requiredPlan: joi.string().required().length(24),
    },
    MAKE_PAYMENT: {
        // vendorId: joi.string().length(24).allow(""),
        vendorId: joi.string().allow(""),
        planId: joi.string().length(24).required(),
        durationType: joi.string().valid([APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR, APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH]),
    },
    GET_BUFFER: {
        vendorId: joi.string().allow(""),
        url: joi.string().required(),
    },
};
