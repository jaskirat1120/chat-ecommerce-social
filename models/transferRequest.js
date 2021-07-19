'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');
// constructor
const Schema = mongoose.Schema;
// const status
const Status = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.CLOSED,
    APP_CONSTANTS.STATUS_ENUM.CANCELLED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
];

const TransferRequest = new Schema({
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, required: true},
    transaction: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.TRANSACTIONS, required: true, index: true},
    amount: {type: Number, defaul: 0},
    reason: {type: String, default: ''},
    status: {type: String, enum: Status, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    requiredOnDate: {type: Number, default: +new Date(), required: true, index: true},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.TRANSFER_REQUEST, TransferRequest);
