'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

const mediaSchema = UniversalFunctions.mediaSchema;
// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const durationType = [
    APP_CONSTANTS.PROMO_DURATION_TYPE.DAY,
    APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH,
    APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR
];

const type = [
    APP_CONSTANTS.PLAN_TYPE.NORMAL,
    APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER,
    APP_CONSTANTS.PLAN_TYPE.ELITE_AD,
    APP_CONSTANTS.PLAN_TYPE.PLUS_CARD,
    APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE,
];

// constructor
const Schema = mongoose.Schema;

const Plans = new Schema({
    name: {},
    description: {},
    type: {type: String, enum: type, default: type[0]},
    preDefinedTemplate: {type: Number, default: 0},
    stockKeepingUnits: {type: Number, default: 0},
    managingAccounts: {type: Number, default: 0},
    clicks: {type: Number, default: 0},
    freeClicks: {type: Number, default: 0},
    users: {type: Number, default: 0},
    localShippingChargesInUSD: {type: Number, default: 8.67},
    localShippingCharges: {type: Number, default: 25},
    currency: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    price: {type: Number, default: 0},
    discountAnnualSubscription: {type: Number, default: 0},
    vendorStores: {type: Number, default: 0},
    vouchers: {type: Number, default: 0},
    storage: {type: Number, default: 0},
    cardUsage: {type: Number, default: 0},
    localShippingDiscount: {type: Number, default: 0},
    perKgPriceShippingInUSD: {type: Number, default: 0.68},
    perKgPriceShipping: {type: Number, default: 0.68},
    onlineCreditCardRates: {type: Number, default: 0},
    CODRates: {type: Number, default: 0},
    walletRates: {type: Number, default: 0},
    eliteBannerCount: {type: Number, default: 0},
    discountVoucherCount: {type: Number, default: 0},
    redirectionPerClickCharges: {type: Number, default: 0},
    media: mediaSchema,
    discountOffer: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    validity: {type: Number, default: 1},
    durationType: {type: String, default: durationType[0], enum: durationType},
    customizationTemplate: {type: Boolean, default: false},
    loyaltyProgram: {type: Boolean, default: false},
    unlimitedUsers: {type: Boolean, default: false},
    autoApproval: {type: Boolean, default: false},
    unlimitedSKU: {type: Boolean, default: false},
    cardVoucher: {type: Boolean, default: false},
    discountVoucher: {type: Boolean, default: false},
    eliteBannerAllowed: {type: Boolean, default: false},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    addedBy: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN, required: true, index: true},
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
        required: true,
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

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS, Plans);
