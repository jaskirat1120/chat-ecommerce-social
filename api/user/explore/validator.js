// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    HOME_API: {
        trendingSocialPostsLimit: joi.number().default(10),
        vendorAdLimit: joi.number()
    },
    LIST_VENDOR: {
        search: joi.string().allow(""),
        vendor: joi.string(),
        category: joi.string().length(24),
        subCategory: joi.string().length(24),
        skip: joi.number(),
        limit: joi.number(),
    },
    CURRENCY_CONVERSION:{
        currency: joi.string().required(),
    },
    LIST_REVIEWS: {
        skip: joi.number(),
        limit: joi.number(),
        vendor: joi.string().length(24)
    },
    LIST_VENDOR_TAGGING: {
        skip: joi.number(),
        limit: joi.number(),
        searchHashTag: joi.string().allow("")
    },
    LIST_VENDOR_MAY_LIKE: {
        type: joi.string().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]),
        skip: joi.number(),
        limit: joi.number()
    },
    TRENDING_VENDORS: {
        search: joi.string().allow(""),
        commonServiceId: joi.string().length(24),
        skip: joi.number(),
        limit: joi.number()
    },
    LIST_OFFERS: {
        skip: joi.number(),
        limit: joi.number()
    },
    VENDOR_DETAIL: {
        vendor: joi.string().required(),
    },
    REDIRECTION_CHARGES: {
        product: joi.string().required()
    },
    LIST_PRODUCT: {
        search: joi.string().allow(""),
        category: joi.string().length(24),
        collectionId: joi.string().length(24),
        subCategory: joi.string().length(24),
        vendor: joi.string(),
        productId: joi.string().length(24),
        filter: joi.string().valid([
            APP_CONSTANTS.PRODUCT_FILTER.NEW_PRODUCTS,
            APP_CONSTANTS.PRODUCT_FILTER.POPULAR_PRODUCTS,
            APP_CONSTANTS.PRODUCT_FILTER.LOWEST_PRICE,
            APP_CONSTANTS.PRODUCT_FILTER.ON_SALE,
            APP_CONSTANTS.PRODUCT_FILTER.FREE_SHIPPING,
            APP_CONSTANTS.PRODUCT_FILTER.EDITOR_PICKS
        ]),
        skip: joi.number(),
        limit: joi.number()
    },
    PRODUCT_DETAIL: {
        productId: joi.string().length(24).required()
    },
    SUB_VENDOR: {
        vendor: joi.string().required(),
        skip: joi.number(),
        limit: joi.number(),
    },
    HOME_SEARCH: {
        origin: joi.string().allow(""),
        category: joi.string().allow("").length(24),
        search: joi.string().allow(""),
        skip: joi.number().default(0),
        limit: joi.number().default(10),
    }
};
