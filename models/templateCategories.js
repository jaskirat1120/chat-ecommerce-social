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

// const status
const typeEnum = [
    APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES
];

// constructor
const Schema = mongoose.Schema;

const TemplateCategory = new Schema({
    name: {type: String},
    type: {type: String},
    themeType: {type: String},
    noOfImages: {type: Number, default: 0},
    defaultImage: UniversalFunctions.mediaSchema,
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.TEMPLATE_CATEGORIES, TemplateCategory);
