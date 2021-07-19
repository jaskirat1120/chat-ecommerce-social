"use strict";

// npm module
const mongoose = require("mongoose");

// Schema constructor object
const Schema = mongoose.Schema;
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
    APP_CONSTANTS.STATUS_ENUM.PENDING,
    APP_CONSTANTS.STATUS_ENUM.FOR_REVIEW,
];

const Products = new Schema({
    product: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
        sparse: true,
        required: true
    },
    weight: {type: String, default: ""},
    unit: {type: String, default: ""},
    colors: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    quantityAvailable: {type: Number, default: 0},
    sizes: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    productNumber: {type: String},
    colorCode: {type: String},
    discount: {type: Number},
    tax: {type: Number},
    price: {type: Number, default: 0},
    priceInUSD: {type: Number, default: 0}, 
    priceInAED: {type: Number, default: 0}, 
    length: {type: Number, default: 0},
    breadth: {type: Number, default: 0},
    height: {type: Number, default: 0},
    cubicWeight: {type: Number, default: 0},
    productCost: {type: Number, default: 0},
    profit: {type: Number, default: 0},
    profitPercentage: {type: Number, default: 0},
    currency: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    images: [UniversalFunctions.mediaSchema],
    videos: [UniversalFunctions.mediaSchema],
    shippingCharges: {type: Number, default: 0},
    availableForSale: {type: Boolean, default: false},
    popularity: {type: Number, default: 0},
    visits: {type: Number, default: 0},
    dailyVisits: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    rating: {type: Number, default: 0},
    noOfRating: {type: Number, default: 0},
    soldOut: {type: Boolean, default: false},

    // status doc field
    status: {type: String, required: true, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.PENDING},

    // doc time log fields
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS, Products);
