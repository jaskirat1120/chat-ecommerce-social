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

// constructor
const Schema = mongoose.Schema;
const image = UniversalFunctions.mediaSchema;
let policyArray = {
    header: {},
    description: {}
}
const AppDefaults = new Schema({
    termsAndCondition: {},
    privacyPolicy: {},
    userPolicy: [policyArray],
    vendorPolicy: [policyArray],
    intellectualPolicy: [policyArray],
    cookiesPolicy: {},
    joinNewsLetter: {},
    websiteDesclaimer: {},
    socialMediaFeedPolicy: {},
    contactAdmin: {type: String},
    address: {type: String},
    emailAdmin: {type: String},
    instagramUrl :{type: String},
    weightForShipping :{type: Number, default: 5},
    defaultShippingCharge :{type: Number, default: 25},
    defaultDeliveryLimit:{type: Number, default: 10},
    duePaymentDays :{type: Number, default: 15},
    facebookUrl :{type: String},
    twitterUrl :{type: String},
    pInterestUrl :{type: String},
    androidAppUrl :{type: String},
    iosAppUrl :{type: String},
    defaultCollectionText :{type: String},
    linkedInUrl :{type: String},
    loginBackgroundImage: image,
    loginBackgroundImageVendor: image,
    defaultCollectionImage: image,
    joinNewsLetterImage: image,
    defaultCollectionFontSize: {type: String},
    defaultCollectionFontColor: {type: String},
    defaultCollectionFontLocation: {type: String},
    status: {type: String, required: true, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.APP_DEFAULTS, AppDefaults);
