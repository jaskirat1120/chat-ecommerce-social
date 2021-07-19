// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    LIST_ORDERS: {
        isCSV: joi.boolean().allow("").valid([true, false]),
        vendorId: joi.string().length(24).allow(""),
        status: joi.string().valid([
            APP_CONSTANTS.LIST_ORDER_STATUS.RECEIVED,
            APP_CONSTANTS.LIST_ORDER_STATUS.ACTIVE,
            APP_CONSTANTS.LIST_ORDER_STATUS.IN_PROCESSING,
            APP_CONSTANTS.LIST_ORDER_STATUS.PAST,
            APP_CONSTANTS.LIST_ORDER_STATUS.DISPATCHED,
            APP_CONSTANTS.LIST_ORDER_STATUS.RETURNED,
            APP_CONSTANTS.LIST_ORDER_STATUS.CANCELLED,
        ]),
        orderStatus: joi.string().valid([
            APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
            APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_CANCELLED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY,
            APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE,
            APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURN_IN_PROGRESS
        ]),
        orderId: joi.string().length(24),
        orderNumber: joi.string().allow(""),
        productOrderId: joi.string().length(24),
        productName: joi.string(),
        colorName: joi.string(),
        skip: joi.number().default(0),
        limit: joi.number().default(10),
        startDate: joi.number(),
        endDate: joi.number(),
        startPrice: joi.number(),
        endPrice: joi.number(),
    },
    CHANGE_ORDER_STATUS:{
        vendorId: joi.string().length(24).allow(""),
        status: joi.string().valid([
            APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
        ]).required(),
        _id: joi.string().length(24).required(),
        trackingUrl: joi.string().allow(""),
        trackingId: joi.string().allow(""),
        goodDescription: joi.string().allow(""),
        deliveryInstructions: joi.string().allow(""),
        labelURL: joi.string().allow(""),
        pickupDetails: joi.object().keys({
            ReadyTime: joi.string(),
            CloseTime: joi.string(),
            SpecialInstructions: joi.string(),
        }),
        noDelivery: joi.boolean().valid([true,false]),
        courierType: joi.string().length(24).allow("")
    },
    BLOCK_UNBLOCK: {
        vendorId: joi.string().length(24).allow(""),
        discountId: joi.string().length(24).required(),
        action: joi.boolean().valid([true, false])
    },
    DOWNLOAD_INVOICE: {
        _id: joi.string().required(),
        currency: joi.string(),
        conversion: joi.number()
    },
    DELETE: {
        vendorId: joi.string().length(24).allow(""),
        discountId: joi.string().length(24).required(),
    },
    ADD_OR_EDIT_DISCOUNT: {
        discountId: joi.string().length(24).allow(""),
        name: joi.object(),
        description: joi.object(),
        code: joi.string().required(),
        usageTime: joi.number().required(),
        expiryDate: joi.number().required(),
        value: joi.number().required(),
        valueType: joi.string().required(),
        vendorId: joi.string().length(24).allow(""),
        product: joi.string().length(24).allow(""),
        minimumAmount: joi.number().optional(),
        maximumValue: joi.number().optional()
    },
    CHECK_REFUND: {
        vendorId: joi.string().length(24).allow(""),
        order: joi.string().length(24).required()
    },
    LIST_DISCOUNT: {
        isCSV: joi.boolean().allow("").valid([true, false]),
        vendorId: joi.string().length(24).allow(""),
        status: joi.string().valid([APP_CONSTANTS.DISCOUNT_STATUS.ACTIVE, APP_CONSTANTS.DISCOUNT_STATUS.EXPIRED, APP_CONSTANTS.DISCOUNT_STATUS.ALL]),
        search: joi.string(),
        skip: joi.number(),
        limit: joi.number()
    },
    LIST_FOLLOWERS: {
        vendorId: joi.string().length(24).allow(""),
        search: joi.string(),
        skip: joi.number(),
        limit: joi.number()
    },
    APPROVE_REFUND: {
        vendorId: joi.string().length(24).allow(""),
        status: joi.string().required().valid([APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED, APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED]),
        requestId: joi.string().required().length(24),
        rejectReason: joi.string().allow("").default("")
    },
    SHARE_DISCOUNT: {
        discount: joi.string().length(24).required(),
        selectedId: joi.array().items(joi.string().length(24)),
        caption: joi.string().description("Caption text for feed"),
        hashTag: joi.array().items(
            joi.string().description('["#video","#hashTag"]')
        ),
        media: UniversalFunctions.mediaAuth,
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO).description("Type of media"),
        privacyType: joi.string().valid([APP_CONSTANTS.PRIVACY_TYPE.PUBLIC, APP_CONSTANTS.PRIVACY_TYPE.PRIVATE, APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE]).default(APP_CONSTANTS.PRIVACY_TYPE.PUBLIC).description("Type of Privacy"),
        type: joi.string().valid([APP_CONSTANTS.FEED_TYPE.SHARE_DISCOUNT_FEED,APP_CONSTANTS.FEED_TYPE.SHARE_DISCOUNT_NOTIFICATION]).allow("")
    },
    CANCEL_ORDER: {
        order: joi.string().length(24).required(),
        cancellationReason: joi.string()
    }
};
