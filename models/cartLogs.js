'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

const Schema = mongoose.Schema;
// const status
const statusEnum = [
    APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED,
    APP_CONSTANTS.CART_STATUS.PRODUCT_UPDATED,
    APP_CONSTANTS.CART_STATUS.PRODUCT_REMOVED,
];

let productModel = {
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true},
    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, index: true},
    productVariant: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS, index: true},
    size: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    color: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    quantity: {type: Number, default: 1},
};

let logs = {
    status: {type: String},
    quantityChanged: {type: Number},
    createdDate: {type: Number},
    actionBy: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, sparse: true}
};

let Cart = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, required: true},
    cart: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CART, index: true, required: true},
    products: productModel,
    productId: {type: Schema.ObjectId},         // _id in array of products from cart model
    status: {type: String, enum: statusEnum, default: APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED},
    logs: [logs],
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CART_LOGS, Cart);
