'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];
// constructor
const Schema = mongoose.Schema;

const VendorBanks = new Schema({
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true},
    bankName: {type: String, trim: true},
    accountHolderName: {type: String, trim: true},
    accountNumber: {type: String, trim: true},
    iBanNumber: {type: String, trim: true},
    swiftCode: {type: String, trim: true},
    status: {type: String, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    default: {type: Boolean, default: false},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.VENDOR_BANKS, VendorBanks);
