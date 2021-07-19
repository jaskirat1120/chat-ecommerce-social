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
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
], mediaType = [
    APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE,
    APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO
];

let models = {
    id: {type: Schema.ObjectId, refPath: 'by'},
    by: {type: String, enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]}
};

const Feeds = new Schema({
    // doc feature fields
    media: UniversalFunctions.mediaSchema,
    mediaType: {type: String, required: true, enum: mediaType, default: mediaType[0]},
    user: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
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
    collectionId: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: false
    },
    privacyType: {
        type: String, enum: [
            APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
            APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
            APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
        ], default: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC
    },
    feedBy: {type: String, enum: [APP_CONSTANTS.USER_TYPE.USER, APP_CONSTANTS.USER_TYPE.VENDOR_OWNER]},
    productId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS},
    discount: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO},
    postId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS},
    vendorId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
    selectedId: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER},
    taggedVendors: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
    caption: {type: String},
    type: {type: String},
    hashTag: {type: [String]},
    hashTagText: {type: String},
    likes: {type: Number, default: 0},
    dailyLikes: {type: Number, default: 0},
    comments: {type: Number, default: 0},
    dailyComments: {type: Number, default: 0},
    share: {type: Number, default: 0},
    favourites: {type: Number, default: 0},
    hiddenFor: {type: [models], default: []},
    reportBy: {type: [models], default: []},
    // status doc field
    status: {type: String, required: true, enum: statusEnum, default: statusEnum[0]},

    // doc time log fields
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS, Feeds);
