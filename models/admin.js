'use strict';
// npm modules
const mongoose = require('mongoose');

// constructor
const Schema = mongoose.Schema;
const APP_CONSTANTS = require('../config/constants/app-defaults');

const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const Admin = new Schema({
    name: {type: String, trim: true, default: null},
    email: {type: String, trim: true, default: null, index: true},
    superAdmin: {type: Boolean, default: true},
    permissions: {type: String},
    isVerified: {type: String},
    OTP: {type: String},
    OTPExpiry: {type: String},
    userType: {type: String, enum: [APP_CONSTANTS.USER_TYPE.ADMIN], default: APP_CONSTANTS.USER_TYPE.ADMIN},
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    password: {type: String, required: true},
    deviceToken: {type: String, required: false},
    language: {type: String, required: false},
    resetPasswordExpiry: {
        type: Number,
        default: 0, required: false, index: true
    },
    issuedAt: {type: Number, default: +new Date()},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN, Admin);
