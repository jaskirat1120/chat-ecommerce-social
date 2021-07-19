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


// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

const signUpEnum = [
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.PHONE_NUMBER,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.EMAIL,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.FACEBOOK,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.APPLE,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.INSTAGRAM,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE,
    APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.NORMAL
];

const deviceType = [
    APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
];
const profileEnum = [
    APP_CONSTANTS.PROFILE_ENUM.PENDING,
    APP_CONSTANTS.PROFILE_ENUM.ADDED,
    APP_CONSTANTS.PROFILE_ENUM.SKIPPED
];

const userTypeEnum = [
    APP_CONSTANTS.USER_TYPE.USER,
    APP_CONSTANTS.USER_TYPE.VENDOR_OWNER
];


const user = new Schema({
    // doc feature fields
    firstName: {type: String, trim: true, index: true},
    lastName: {type: String, trim: true, index: true},
    email: {type: String, trim: true, index: true},
    phoneNumber: {type: ContactDetails},
    password: {type: String, trim: true, index: true},
    passwordLastUpdated: {type: Number, default: +new Date()},
    dob: {type: Number, default: +new Date()},
    gender: {type: String, default: ""},
    city: {type: String, default: ""},
    signUpBy: {
        type: String, trim: true, enum: signUpEnum
    },
    bio: {type: String, trim: true},
    currency: {type: String, trim: true, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    profilePic: picUrl,
    profileStatus: {type: String, enum: profileEnum, default: APP_CONSTANTS.PROFILE_ENUM.PENDING},
    userType: {type: String, enum: userTypeEnum, default: APP_CONSTANTS.USER_TYPE.USER},

    deviceType: {
        type: String, trim: true, enum: deviceType
    },

    OTP: {type: String, trim: true, index: true},
    googleId: {type: String, trim: true, index: true},
    instagramId: {type: String, trim: true, index: true},
    facebookId: {type: String, trim: true, index: true},
    appleId: {type: String, trim: true, index: true},

    OTPExpiry: {type: Number, trim: true, index: true},

    emailVerified: {type: Boolean, default: false},

    isVerified: {type: Boolean, default: true},

    language: {type: String, default: APP_CONSTANTS.DATABASE.LANGUAGES.EN},

    deviceToken: {type: String, index: true},
    interests: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, default: []},

    status: {type: String, index: true, enum: statusEnum, default: statusEnum[0]},

    issuedAt: {type: Number},         // access token issued when
    closedAt: {type: Number},
    dataDeleted: {type: Boolean, default: false},
    lastLogin: {type: Number, index: true},
    walletMoney: {type: Number, default: 0},
    accessToken: {},
    followers: {type: Number, default: 0},
    followings: {type: Number, default: 0},
    referralUsed: {type: String, default: ""},
    referralCode: {type: String, default: ""},
    reason: {type: String, default: ""},
    resetPasswordExpiry: {
        type: Number,
        default: 0, required: false, index: true
    },
    activeAgo: {type: Number, default: 0},
    active: {type: Boolean, default: false},
    notifications: {type: Boolean, default: true},
    privacyType: {
        type: String, enum: [
            APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
            APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
        ], default: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE
    },
    adminUpdateId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

function locationValidate(val) {
    return val.length === 2;
}

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.USER, user);
