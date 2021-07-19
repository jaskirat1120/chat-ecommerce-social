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
const ratingEnum = [
    APP_CONSTANTS.RATING_TYPE.VENDOR_RATING,
    APP_CONSTANTS.RATING_TYPE.ORDER_RATING,
    APP_CONSTANTS.RATING_TYPE.PRODUCT_RATING,
];

const Ratings = new Schema({

    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, index: true},
    order: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, index: true},
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, index: true},
    ratingBy: {
        type: Schema.ObjectId,
        refPath: 'ratingByModel'
    },
    ratingByModel: {
        type: String, enum: [
            APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        ]
    },
    type: {type: String, enum: ratingEnum, default: APP_CONSTANTS.RATING_TYPE.ORDER_RATING},
    ratings: {type: Number, default: 1},
    comments: {type: String, default: ""},
    status: {type: String, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.RATINGS, Ratings);
