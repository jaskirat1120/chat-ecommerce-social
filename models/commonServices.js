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
    APP_CONSTANTS.COMMON_SERVICES_TYPE.COURIER_SERVICE,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.COVERAGE_AREA,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.COLORS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.SIZES,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.COUNTRY,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.INTERESTS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_ADMIN_AD,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_PAID_AD,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.TEAMS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.NEWS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.CONTACT_US_REASON,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.PROCESSING_TIME,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.SKILLS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.LOCATIONS,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.UPDATES,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER_AREA,
    APP_CONSTANTS.COMMON_SERVICES_TYPE.WHATS_NEW
], mediaType = [
    APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE,
    APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO
];

const mediaSchema = UniversalFunctions.mediaSchema;

// constructor
const Schema = mongoose.Schema;

const CommonServices = new Schema({
    name: {},
    description: {},
    days: {type: Number},
    designation: {type: String},
    twitterUrl: {type: String},
    facebookUrl: {type: String},
    googleUrl: {type: String},
    address: {type: String},
    mediaType: {type: String, required: true, enum: mediaType, default: mediaType[0]},
    courierServiceUrl: {type: String, default: "", trim: true},
    blogUrl: {type: String, default: "", trim: true},
    courierServiceType: {type: String, default: APP_CONSTANTS.COURIER_SERVICE_TYPE.SKYNET, trim: true},
    colorCode: {type: String, default: ""},
    fontTypeName: {type: String, default: ""},
    fontSizeName: {type: String, default: 0},
    fontColorName: {type: String, default: ""},
    fontLocationName: {type: String, default: ""},
    fontTypeDescription: {type: String, default: ""},
    fontSizeDescription: {type: String, default: 0},
    fontColorDescription: {type: String, default: ""},
    fontLocationDescription: {type: String, default: ""},
    careerArea: {type: String, default: ""},
    location: {type: String, default: ""},
    skill: {type: String, default: ""},
    parentId: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
        default: null,
        index: true
    },
    vendor: {
        type: [Schema.Types.ObjectId],
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        default: [],
        index: true
    },
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    media: mediaSchema,

    duration: {type: Number, default: 5},
    inCoverageArea: {type: Boolean, default: false},
    type: {
        type: String, enum: typeEnum, default: APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE
    },
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

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, CommonServices);
