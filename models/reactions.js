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
    APP_CONSTANTS.STATUS_ENUM.LIKE,
    APP_CONSTANTS.STATUS_ENUM.UNLIKE,
    APP_CONSTANTS.STATUS_ENUM.FAVOURITE,
    APP_CONSTANTS.STATUS_ENUM.UNFAVOURITE,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

// const status
const reactionTypeEnum = [
    APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.POST_SHARE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_SHARE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_FAVOURITE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_SHARE,
    APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_LIKE
];

let logs = {
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date()},
    reactionType: {
        type: String,
        required: true,
        enum: reactionTypeEnum,
        default: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
    },
    actionBy: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, sparse: true},
    userType: {type: String}
};

const reactions = new Schema({
    // doc feature fields
    user: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
        sparse: true,
        required: false
    },

    feed: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
        sparse: true,
        required: false
    },

    vendor: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        sparse: true,
        required: false
    },

    product: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
        sparse: true,
        required: false
    },

    reactionType: {
        type: String,
        required: true,
        enum: reactionTypeEnum,
        default: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
    },

    // status doc field
    status: {type: String, required: true, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.LIKE},

    logs: {type: [logs]},

    // doc time log fields
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.REACTIONS, reactions);
