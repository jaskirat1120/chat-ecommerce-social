
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

const Reports = new Schema({
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
    feed: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
        sparse: true,
        required: false
    },
    comment: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMENTS,
        sparse: true,
        required: false
    },
    type: {
        type: String, default: APP_CONSTANTS.REPORT_TYPE.FEED, enum: [APP_CONSTANTS.REPORT_TYPE.FEED, APP_CONSTANTS.REPORT_TYPE.ISSUE, APP_CONSTANTS.REPORT_TYPE.CONTACT_US]
    },
    reason: {
        type: String, default: ""
    },
    title: {
        type: String, default: ""
    },
    reportBy: {
        type: Schema.ObjectId,
        index: true,
        refPath: 'reportByModel',
        sparse: true,
        required: false
    },
    reportByModel:{
        type: String
    }, 
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

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_REPORTS, Reports);
