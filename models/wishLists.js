'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');
const Schema = mongoose.Schema;
// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.DELETED
];

let priorityEnum=[
    APP_CONSTANTS.PRIORITY.HIGH,
    APP_CONSTANTS.PRIORITY.LOW,
    APP_CONSTANTS.PRIORITY.MEDIUM,
    APP_CONSTANTS.PRIORITY.HIGHEST,
];
// constructor

let productModel = {
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true},
    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, index: true},
    productVariant: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS, index: true},
    size: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    color: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    quantity: {type: Number, default: 1},
};

let Wishlist = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, required: true},
    products: productModel,
    priority: {type: String, enum: priorityEnum, default: APP_CONSTANTS.PRIORITY.MEDIUM},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.WISH_LIST, Wishlist);
