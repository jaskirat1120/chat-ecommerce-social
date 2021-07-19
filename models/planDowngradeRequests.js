'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.PENDING,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const durationType = [
    APP_CONSTANTS.PROMO_DURATION_TYPE.DAY,
    APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH,
    APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR
]

// constructor
const Schema = mongoose.Schema;

const Promo = new Schema({
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, required: true},
    currentPlan: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS, required: true, index: true},
    requiredPlan: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS, required: true, index: true},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
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

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.PLAN_DOWNGRADE_REQUEST, Promo);
