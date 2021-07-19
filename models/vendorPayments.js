'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

// constructor
const Schema = mongoose.Schema;
const paymentStatusEnum = [
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PRE_AUTHORIZED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
];
const refundStatus = [
    APP_CONSTANTS.REFUND_STATUS.COMPLETED,
    APP_CONSTANTS.REFUND_STATUS.INITIATED,
    APP_CONSTANTS.REFUND_STATUS.REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.REJECTED,
    APP_CONSTANTS.REFUND_STATUS.CANCELLED
];
let Transactions = new Schema(
    {
        user: {type: Schema.Types.ObjectId, refPath: APP_CONSTANTS.DATABASE.MODELS_NAME.USER},
        vendor: {type: Schema.Types.ObjectId, refPath: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
        transactionType: {
            type: String, enum: [
                APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
                APP_CONSTANTS.TRANSACTION_TYPES.ORDER
            ]
        },
        orderId: {type: Schema.Types.ObjectId, index: true},        // Ref to orderId in order table generated same for all order for same cart
        vendorOrderId: {type: Schema.Types.ObjectId, index: true},        // Ref to orderId in order table generated same for all order for same cart
        orderNumber: {type: String},
        //    Complete Amount for the order //
        subTotal: {type: Number, default: 0},
        adminProductCharges: {type: Number, default: 0},
        adminCharges: {type: Number, default: 0},
        tax: {type: Number, default: 0},
        productTotalTax: {type: Number, default: 0},
        productTax: {type: Number, default: 0},
        deliveryCharges: {type: Number, default: 0},
        finalTotal: {type: Number, default: 0},
        amount: {type: Number, default: 0},
        paymentMethod: {type: String},
        shippingCharges: {type: Number, default: 0},
        shippingChargesAfterDiscount: {type: Number, default: 0},
        shippingChargesDiscount: {type: Number, default: 0},
        paymentMethodCharge: {type: Number, default: 0},
        ///////////////////////////////////////

        // Price for each product for which order is created /////
        productPrice: {type: Number, default: 0},
        quantity: {type: Number, default: 1},
        /////////////////////////////////////

        order: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, index: true},  // Ref to _id in order table for all different order for vendor
        currency: {type: String, trim: true, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
        status: {
            type: String, enum: paymentStatusEnum,
            default: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
        },
        refundStatus: {
            type: String,
            enum: refundStatus,
            default: APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
        },
        refundQuantity: {
            type: Number,
            default: 0
        },
        pId: {type: String},
        transactionId: {type: String},
        referenceNo: {type: String},
        createdDate: {type: Number, default: +new Date()},
        updatedDate: {type: Number, default: +new Date()},
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });
module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.VENDOR_PAYMENTS, Transactions);
