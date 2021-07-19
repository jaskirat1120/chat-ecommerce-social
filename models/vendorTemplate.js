'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const mediaSchema = UniversalFunctions.mediaSchema;

// constructor
const Schema = mongoose.Schema;

const VendorTemplate = new Schema({
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true},
    images: [mediaSchema],
    banner: mediaSchema,
    headerColor: {type: String},
    headerBackground: mediaSchema,
    headerTextColor: {type: String},
    headerTextFontSize: {type: Number},
    template: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.TEMPLATE_CATEGORIES},
    noOfImages: {type: Number},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.VENDOR_TEMPLATES, VendorTemplate);
