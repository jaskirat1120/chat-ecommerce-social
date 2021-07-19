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

const CollectionProduct = new Schema({
    // doc feature fields
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true},
    collectionId: {
        type: Schema.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: true
    },
    products: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, index: true},
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


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.COLLECTION_PRODUCTS, CollectionProduct);
