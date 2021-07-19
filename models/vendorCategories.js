"use strict";

// npm module
const mongoose = require("mongoose");

// Schema constructor object
const Schema = mongoose.Schema;
const APP_CONSTANTS = require('../config/constants/app-defaults');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

// const status
const typeEnum = [
    APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES,
];


const vendorCategories = new Schema({
    // doc feature fields
    vendor: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        sparse: true,
        required: true
    },
    category: {
        type: [Schema.ObjectId],
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: true
    },
    subCategory: {
        type: [Schema.ObjectId],
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: true
    },
    type: {type: String, enum: typeEnum, default: APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES},
    // status doc field
    status: {type: String, required: true, enum: statusEnum, default: statusEnum[0]},

    // doc time log fields
    createdDate: {type: Number, required: true, default: Date.now()},
    updatedDate: {type: Number, required: true, default: Date.now()},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.VENDOR_CATEGORIES, vendorCategories);
