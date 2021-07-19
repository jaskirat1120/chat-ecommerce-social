'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

// constructor
const Schema = mongoose.Schema;

const creditLogs = new Schema({
    addedBy: {
        _id: {type: Schema.Types.ObjectId, refPath: "creditLogs.addedBy.type"},
        type: {
            type: String, enum: [
                APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            ]
        }
    },
    status: {
        type: String, enum: [
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
        ],
        default: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
    },
    paymentMethod: {type: String},
    createdAt: {type: Number},
    transactionId: {type: String, default: ''},
    pId: {type: String}, // payment ID to verify the payment
    amount: {type: Number}, // payment ID to verify the payment
});


const CreditManagement = new Schema({
        vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, trim: true, index: true},
        user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, trim: true, index: true},
        order: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, index: true},
        orderId: {type: Schema.ObjectId, default: null},
        addedByAdmin: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
        addedByVendor: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
        type: {
            type: String, enum: [
                APP_CONSTANTS.CREDIT_TYPE.CREDIT,
                APP_CONSTANTS.CREDIT_TYPE.DEBIT,
                APP_CONSTANTS.CREDIT_TYPE.POINTS,
                APP_CONSTANTS.CREDIT_TYPE.LIMIT_CHANGE,
                APP_CONSTANTS.CREDIT_TYPE.PROCESSING,
                APP_CONSTANTS.CREDIT_TYPE.FAILED
            ]
        },
        commissionPercentage: {type: Number},
        transactionId: {type: String},
        status: {
            type: String, enum: [
                APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
                APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
            ],
            default: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
        },
        createdAt: {type: Number},
        pId: {type: String}, // payment ID to verify the payment
        amount: {type: Number}, // payment ID to verify the payment
        amountWithTax: {type: Number}, // payment ID to verify the payment
        transactionFees: {type: Number},
        createdDate: {type: Number, default: +new Date()},
        updatedDate: {type: Number, default: +new Date()},
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        } // inserts createdAt and updatedAt
    });

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CREDIT_MANAGEMENT, CreditManagement);
