'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');
// constructor
const Schema = mongoose.Schema;
// const status
const refundStatus = [
    APP_CONSTANTS.REFUND_STATUS.COMPLETED,
    APP_CONSTANTS.REFUND_STATUS.INITIATED,
    APP_CONSTANTS.REFUND_STATUS.REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
];

let logs = {
    status: {type: String, enum: refundStatus, default: refundStatus[2]},
    createdDate: {type: Number, default: +new Date()},
    actionBy: {type: Schema.Types.ObjectId, refPath: 'logs.actionByModel', index: true, sparse: true},
    actionByModel: {type: String},
    userType: {type: String}
};

const type = [
    APP_CONSTANTS.RETURN_TYPE.REFUND,
    APP_CONSTANTS.RETURN_TYPE.REPLACEMENT
];



const RefundRequest = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, required: true},
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, required: true},
    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, required: true},
    order: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, required: true, index: true},
    transaction: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.TRANSACTIONS, required: true, index: true},
    refundQuantity: {
        type: Number,
        default: 0
    },
    productRefundAmount: {
        type: Number,
        default: 0 
    },
    refundAmount: {
        type: Number,
        default: 0 
    },
    media: [UniversalFunctions.mediaSchema],
    reason: {type: String, default: ''},
    rejectReason: {type: String, default: ''},
    refundReason: {type: String, default: ''},
    selectedReason: {type: String, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    status: {type: String, enum: refundStatus, default: APP_CONSTANTS.REFUND_STATUS.REQUESTED},
    logs: [logs],
    type: {type: String, enum: type, default: type[0]},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.REFUND_REQUEST, RefundRequest);
