'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// constructor
const Schema = mongoose.Schema, mediaType = [
    APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE,
    APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO
];
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const SubscriptionLogs = new Schema({
    plan: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS, index: true},
    vendor: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        required: true,
        index: true
    },
    subType: {
        type: String, enum: [
            APP_CONSTANTS.SUBSCRIPTION_TYPE.DEFAULT,
            APP_CONSTANTS.SUBSCRIPTION_TYPE.RENEWAL
        ]
    },
    pt_customer_email: {type: String},
    pt_customer_password: {type: String},
    pt_token : {type: String},
    startDate: {type: Number, required: true, index: true},
    endDate: {type: Number, required: true, index: true},
    clicks: {type: Number, required: false, index: true},
    freeClicks: {type: Number, required: false, index: true},
    totalClicks: {type: Number, required: false, index: true},
    transactionId: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.TRANSACTIONS},
    type: {type: String, enum: [
        APP_CONSTANTS.PLAN_TYPE.NORMAL,
        APP_CONSTANTS.PLAN_TYPE.PLUS_CARD,
        APP_CONSTANTS.PLAN_TYPE.ELITE_AD,
        APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER,
        APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE
    ], default: APP_CONSTANTS.PLAN_TYPE.NORMAL},
    discountOffer: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    name: {},
    description: {},
    textColor: {type: String, default: "#fff"},
    textNameSize: {type: Number, default: 12},
    textDescriptionSize: {type: Number, default: 16},
    status: {type: String, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    mediaType: {type: String, required: true, enum: mediaType, default: mediaType[0]},
    isAdminApproved: {type: Boolean, required: false, default: false},
    media: UniversalFunctions.mediaSchema,
    logType: {
        type: String, enum: [
            APP_CONSTANTS.SUBSCRIPTION_LOGS.BOUGHT,
            APP_CONSTANTS.SUBSCRIPTION_LOGS.DEFAULT,
            APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED,
            APP_CONSTANTS.SUBSCRIPTION_LOGS.RENEWAL
        ], index: true, required: true
    },
    emailAndNotificationSent: [{
        type: String, enum: [
            APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_ABOUT_TO_EXPIRE,
            APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_EXPIRED,
            APP_CONSTANTS.NOTIFICATION_LOGS.NOTIFICATION_ABOUT_TO_EXPIRE,
            APP_CONSTANTS.NOTIFICATION_LOGS.NOTIFICATION_EXPIRED
        ]
    }],
    durationType: {type: String},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()}
}, {
    timestamps: {
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt',
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS, SubscriptionLogs);
