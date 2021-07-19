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
    APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES,
    APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS,
];

const mediaSchema = UniversalFunctions.mediaSchema;

// constructor
const Schema = mongoose.Schema;

const Category = new Schema({
    name: {},
    description: {},
    parentId: {
        type: [Schema.Types.ObjectId],
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        default: null,
        index: true
    },
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    media: [mediaSchema],
    type: {
        type: String, enum: typeEnum, default: APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES
    },
    rank: {type: Number, default: 1},
    popularity: {type: Number, default: 0},
    visits: {type: Number, default: 0},
    dailyVisits: {type: Number, default: 0},
    fontTypeName: {type: String, default: ""},
    fontSizeName: {type: String, default: 0},
    fontColorName: {type: String, default: ""},
    fontLocationName: {type: String, default: ""},
    fontTypeDescription: {type: String, default: ""},
    fontSizeDescription: {type: String, default: 0},
    fontColorDescription: {type: String, default: ""},
    fontLocationDescription: {type: String, default: ""},
    addedBy: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN, required: false, index: true},
    addedByVendor: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        required: false,
        index: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
        required: false,
        index: true
    },
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES, Category);
