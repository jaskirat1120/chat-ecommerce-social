'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');
const Schema = mongoose.Schema;
// const status
const statusEnum = [
    APP_CONSTANTS.CART_STATUS.ACTIVE,
    APP_CONSTANTS.CART_STATUS.EMPTY,
    APP_CONSTANTS.CART_STATUS.ORDER_COMPLETE,
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

let Cart = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, required: true},
    discountId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, required: false, default: null},
    products: {type: [productModel], default: []},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    discountCode: {type: String, default: ""},
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CART, Cart);
