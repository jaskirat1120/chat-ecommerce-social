'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

// const status
const typeEnum = [
    APP_CONSTANTS.COMMON_LOGS.CATEGORY_VISIT,
    APP_CONSTANTS.COMMON_LOGS.PRODUCT_VISIT,
    APP_CONSTANTS.COMMON_LOGS.WEBSITE_VISIT,
    APP_CONSTANTS.COMMON_LOGS.REDIRECTION,
    APP_CONSTANTS.COMMON_LOGS.VENDOR_VISIT
];

// constructor
const Schema = mongoose.Schema;

const CommonLogs = new Schema({
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
    category: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES},
    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS},
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER},
    ip: {type: String},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    type: {
        type: String, enum: typeEnum, default: APP_CONSTANTS.COMMON_LOGS.WEBSITE_VISIT
    },
    popularity: {type: Number, default: 1},
    visitor: {type: Number, default: 1},
    restrictedVisit: {type: Number, default: 1},
    date: {type: String},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_LOGS, CommonLogs);
