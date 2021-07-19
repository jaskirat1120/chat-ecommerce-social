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
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
    APP_CONSTANTS.STATUS_ENUM.PENDING
];

const type = [
    APP_CONSTANTS.PROMO_TYPE.PROMO,
    APP_CONSTANTS.PROMO_TYPE.OFFER,
    APP_CONSTANTS.PROMO_TYPE.GIFT_CARD
]
const durationType = [
    APP_CONSTANTS.PROMO_DURATION_TYPE.DAY,
    APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH,
    APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR
]

// constructor
const Schema = mongoose.Schema;

const Promo = new Schema({
    name: {},
    description: {},
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
    code: {type: String, required: true, index: true},
    validity: {type: Number, default: 1},
    amount: {type: Number, default: 0},
    password: {type: String},
    redeemed: {type: Boolean, default: false},
    usageTime: {type: Number},
    value: {type: Number, default: 0},
    minimumAmount: {type: Number, default: 0},
    maximumValue: {type: Number, default: 0},
    valueType: {type: String, enum: [APP_CONSTANTS.PROMO_VALUE_TYPE.PERCENTAGE, APP_CONSTANTS.PROMO_VALUE_TYPE.VALUE], default: APP_CONSTANTS.PROMO_VALUE_TYPE.PERCENTAGE},
    durationType: {type: String, default: durationType[0], enum: durationType},
    type: {type: String, enum: type, default: type[0]},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    pId: {type: String, default: ""},
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true},
    addedBy: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN, required: false, index: true},
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
        required: false,
        index: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
        required: false,
        index: true
    },
    expiryDate: {type: Number},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO, Promo);
