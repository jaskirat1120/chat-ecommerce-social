'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];
let ContactDetails = {
    phoneNo: {type: String, trim: true, index: true},
    countryCode: {type: String, trim: true, index: true},
    ISO: {type: String, default: ''},
};

// constructor
const Schema = mongoose.Schema;

const userAddress = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true},
    name: {type: String, trim: true},
    contactDetails: ContactDetails,
    zipCode: {type: String, trim: true, index: true},
    street: {type: String, trim: true},
    building: {type: String, trim: true},
    state: {type: String, default: '', trim: true},
    country: {type: String, default: '', trim: true},
    countryId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, trim: true},
    city: {type: String, default: '', trim: true},
    lat: {type: Number, default: 0},
    long: {type: Number, default: 0},
    latLong: {type: [Number], index: '2dsphere'},
    status: {type: String, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    default: {type: Boolean, default: false},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.USER_ADDRESSES, userAddress);
