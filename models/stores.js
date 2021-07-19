'use strict';

// npm modules
const mongoose = require('mongoose');
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunction = require('../utils/universal-functions');

// constructor
const Schema = mongoose.Schema;

let picUrl = UniversalFunction.mediaSchema;

let ContactDetails = {
    phoneNo: {type: String, trim: true, index: true},
    countryCode: {type: String, trim: true, index: true},
    ISO: {type: String, default: ''},
};

let addressObj = {
    latLong: {
        type: [Number], index: '2dsphere', validate: [locationValidate, '{PATH} should have' +
        '2 values']
    },
    lat: {type: Number},
    long: {type: Number},
    zipCode: {type: String},
    completeAddress: {type: String, trim: true}
};

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
];

const deviceType = [
    APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
];


const stores = new Schema({
        // doc feature fields
        vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, required: true},
        name: {type: String, trim: true, index: true},
        phoneNumber: {type: ContactDetails},

        latLong: {
            type: [Number], index: '2dsphere', validate: [locationValidate, '{PATH} should have' +
            '2 values']
        },

        area: {},

        billing: {},
        trade: {},
        license: UniversalFunction.mediaSchema,

        signature: UniversalFunction.mediaSchema,

        address: {type: addressObj},

        parentId: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.STORES, default: null, index: true},

        isVerified: {type: Boolean, default: false},

        status: {type: String, index: true, enum: statusEnum, default: statusEnum[0]},
        adminUpdateId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
        adminCreateId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
        createdDate: {
            type: Number,
            default: +new Date(), required: true, index: true
        },
        updatedDate: {type: Number, default: +new Date(), required: true, index: true},
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        } // inserts createdAt and updatedAt
    });

function locationValidate(val) {
    return val.length === 2;
}

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.STORES, stores);
