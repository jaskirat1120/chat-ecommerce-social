// npm modules
const joi	=	require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');

module.exports = {
    GET_VENDOR : {
        isCSV: joi.boolean().valid([true, false]).allow(""),
		search:joi.string(),
        country:joi.string().length(24).allow(""),
        vendorPurpose:joi.string().allow("").valid([APP_CONSTANTS.VENDOR_PURPOSE.GALLERY,APP_CONSTANTS.VENDOR_PURPOSE.TRADING ]),
        vendorSize:joi.string().length(24).allow(""),
        startDate: joi.number(),
        endDate: joi.number(),
        isVerified: joi.boolean().valid([true, false]),
        isAdminVerified: joi.boolean().valid([true, false]),
        plan: joi.string().length(24).allow(""),
        skip:joi.number(),
        limit:joi.number()
    },
    PRODUCT_LISTING : {
        isCSV: joi.boolean().allow("").valid([true, false]),
        productName:joi.string(),
        skip:joi.number(),
        limit:joi.number(),
        availableForSale: joi.boolean(),
        startDate: joi.number(),
        endDate: joi.number(),
        endPrice: joi.number(),
        startPrice: joi.number(),
        endDiscount: joi.number(),
        startDiscount: joi.number(),
        category: joi.string().allow("").length(24),
        subCategory: joi.string().allow("").length(24),
        isAdminVerified: joi.boolean(),
        shippingChargesType:joi.string().valid([APP_CONSTANTS.SHIPPING_CHARGES_TYPE.FIXED, APP_CONSTANTS.SHIPPING_CHARGES_TYPE.FREE]).allow(""),
        shippingCourier:joi.string().length(24).allow(""),
        vendorName: joi.string().allow("")
    },
    VENDOR_DETAILS : {
        vendorId : joi.string().length(24).required(),
    },
    BLOCK_VENDOR : {
        vendorId : joi.string().length(24).required(),
        action:joi.boolean().description('True to block ,False to unblock').required()
    },
    UPDATE_VENDOR : {
        vendorId : joi.string().length(24).required(),
        autoApprovalProduct : joi.boolean().valid([true, false]),
    },
    UPDATE_PRODUCT : {
        productId : joi.string().length(24).required(),
        productTag : joi.string().allow(""),
    },
    BLOCK_PRODUCT : {
        productId : joi.string().length(24).required(),
        action:joi.boolean().description('True to block ,False to unblock').required()
    },
    DELETE_PRODUCT : {
        _id : joi.string().length(24).required(),
    },
    VERIFY_VENDOR : {
        vendorId : joi.string().length(24).required(),
        action:joi.boolean().description('True to verify ,False to disapprove').required(),
        reason: joi.string()
    },
    APPROVE_PRODUCT : {
        productId : joi.string().length(24).required(),
        action:joi.boolean().description('True to approve ,False to disapprove').required(),
        reason: joi.string()
    },
    DELETE_VENDOR : {
        vendorId : joi.string().length(24).required(),
    },
}
