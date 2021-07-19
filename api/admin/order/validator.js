// npm modules
const joi	=	require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');

module.exports = {
    LIST_ORDERS: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        status: joi.string().valid([
            APP_CONSTANTS.LIST_ORDER_STATUS.ALL,
            APP_CONSTANTS.LIST_ORDER_STATUS.OPEN,
            APP_CONSTANTS.LIST_ORDER_STATUS.CLOSED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
            APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY,
            APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE,
            APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURN_IN_PROGRESS,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_CANCELLED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
            APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
            APP_CONSTANTS.LIST_ORDER_STATUS.IN_PROCESSING,
        ]),
        vendorName: joi.string().allow(""),
        productName: joi.string().allow(""),
        orderNumber: joi.string().allow(""),
        subOrderNumber: joi.string().allow(""),
        paymentStatus: joi.string().allow([
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED
        ]),
        paymentMethod: joi.string().valid([
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET,
        ]).allow(""),
        skip: joi.number(),
        limit: joi.number(),
        startDate: joi.number(),
        endDate: joi.number(),
    },
    EARNING_LISTING: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        vendorName: joi.string().allow(""),
        deviceType: joi.string().allow("").valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB]),
        transaction: joi.array().items(joi.string().length(24).allow("")),
        transferred: joi.boolean().valid([true, false]),
        transactionType: joi.string().valid([
            APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
            APP_CONSTANTS.TRANSACTION_TYPES.WALLET,
            APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
            APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
        ]),
        type: joi.string().optional().valid([
            // APP_CONSTANTS.TRANSACTION_LISTING.ALL,
            // APP_CONSTANTS.TRANSACTION_LISTING.RECEIVED,
            // APP_CONSTANTS.TRANSACTION_LISTING.DEDUCTED,
            APP_CONSTANTS.TRANSACTION_LISTING.DUE_PAYMENT,
            // APP_CONSTANTS.TRANSACTION_LISTING.WALLET_BALANCE,
        ]),
        startDate: joi.number(),
        endDate: joi.number(),
        skip: joi.number(),
        limit: joi.number(),
    },
    TRANSFER_LISTING: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        vendorName: joi.string().allow(""),
        status: joi.string().valid([
            APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            APP_CONSTANTS.STATUS_ENUM.INACTIVE,
            APP_CONSTANTS.STATUS_ENUM.CLOSED,
            APP_CONSTANTS.STATUS_ENUM.CANCELLED,
        ]),
        startDate: joi.number(),
        endDate: joi.number(),
        skip: joi.number(),
        limit: joi.number(),
    },
    DOWNLOAD_INVOICE: {
        _id: joi.string().required(),
        currency: joi.string(),
        conversion: joi.number()
    },
    TRANSFER_DONE: {
        transferRequestId: joi.string().length(24).required(),
        status: joi.string().valid([
            APP_CONSTANTS.STATUS_ENUM.CLOSED,
            APP_CONSTANTS.STATUS_ENUM.CANCELLED,
        ]).required(), 
    },
    CHECK_REFUND_REQUEST: {
        order: joi.string().length(24).required(),
    },
    TRANSACTION_TRANSFER:{
        transactionId: joi.string().length(24).required(),
        transferred: joi.boolean().valid([true, false]).required()
    }
}
