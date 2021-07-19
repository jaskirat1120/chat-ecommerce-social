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
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
];

const deviceType = [
    APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
];

const userTypeEnum = [
    APP_CONSTANTS.USER_TYPE.USER,
    APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
    APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT,
    APP_CONSTANTS.USER_TYPE.VENDOR_MEMBER,
    APP_CONSTANTS.USER_TYPE.SUB_VENDOR
];

const vendorPurposeEnum = [
    APP_CONSTANTS.VENDOR_PURPOSE.TRADING,
    APP_CONSTANTS.VENDOR_PURPOSE.GALLERY,
    APP_CONSTANTS.VENDOR_PURPOSE.EXPANSION,
];

const bankDetailModel = {
    iBan: {type: String, default: ""},
    country: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    name: {type: String}
};

const profileEnum = [
    APP_CONSTANTS.PROFILE_ENUM.PENDING,
    APP_CONSTANTS.PROFILE_ENUM.ADDED,
    APP_CONSTANTS.PROFILE_ENUM.SKIPPED
];

const socialLinks = {
    type: {type: String, default: ''},
    link: {type: String, default: ''}
};
const planData ={
    plan: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS, index: true, sparse: true},
    subscriptionLogId: {
        type: Schema.Types.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS,
        index: true,
        sparse: true
    },
    durationType: {type: String},
    startDate: {type: Number, default: 0},
    endDate: {type: Number, default: 0},
    type: {type: String}
};

const vendors = new Schema({
        // doc feature fields
        name: {type: String, trim: true, index: true},
        firstName: {type: String, trim: true},
        lastName: {type: String, trim: true},
        description: {type: String, trim: true, index: true},
        hashTag: {type: String, trim: true, index: true},
        permissions: {type: String},
        vendorRegisterName: {type: String, trim: true, index: true},
        currency: {type: String, trim: true, index: true, default: "AED"},
        banner: UniversalFunction.mediaSchema,
        country: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
        phoneNumber: {type: ContactDetails},
        saleContact: ContactDetails,
        email: {type: String, trim: true, index: true},
        password: {type: String, trim: true, index: true},
        latLong: {
            type: [Number], index: '2dsphere', validate: [locationValidate, '{PATH} should have' +
            '2 values']
        },
        activeAgo: {type: Number, default: 0},
        active: {type: Boolean, default: false},
        vendorPurpose: {type: String, enum: vendorPurposeEnum, default: APP_CONSTANTS.VENDOR_PURPOSE.TRADING},
        vendorSize: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, default: null},
        courierService: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, default: null},
        ownerId: UniversalFunction.mediaSchema,
        coverageArea: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, default: null},
        noDelivery: {type: Boolean, default: false},
        age: {type: Number, default: 0},
        monthlySale: {type: Number, default: 0},
        ownerBio: {type: String, default: ""},
        themeType: {type: String, default: ""},
        position: {type: String, default: ""},
        vendorStory: {type: String, default: ""},
        vendorPolicy: {type: String, default: ""},
        vendorAd: {type: String, default: ""},
        vendorAdImage: UniversalFunction.mediaSchema,
        vendorAdVideo: UniversalFunction.mediaSchema,
        socialLinks: [socialLinks],
        businessDescription: {type: String, default: ""},
        profileStatus: {type: String, enum: profileEnum, default: APP_CONSTANTS.PROFILE_ENUM.ADDED},

        subscription: planData,
        discountOfferPlan: planData,
        eliteAdPlan: planData,
        plusCardPlan: planData,
        redirectionPlan: planData,
        
        bankDetails: {type: bankDetailModel, default: null},
        availabilityForTrade: UniversalFunction.mediaSchema,
        license: UniversalFunction.mediaSchema,
        passportCopy: UniversalFunction.mediaSchema,
        selfieWithPassport: UniversalFunction.mediaSchema,
        marketingVideo: UniversalFunction.mediaSchema,
        ownerPicture: UniversalFunction.mediaSchema,
        webExternalUrl: {type: String, trim: true},
        tradingAuthorized: {type: Boolean, default: false},
        autoApprovalProduct: {type: Boolean, default: false},
        inheritPolicy: {type: Boolean, default: false},
        webUrl: {type: Boolean, default: false},
        popularity: {type: Number, default: 0},
        visits: {type: Number, default: 0},
        dailyVisits: {type: Number, default: 0},
        likes: {type: Number, default: 0},
        dailyLikes: {type: Number, default: 0},
        orderCount: {type: Number, default: 0},
        OTP: {type: String, default: ""},
        rating: {type: Number, default: 0},
        noOfRating: {type: Number, default: 0},
        selectedNotificationType: {type: [String], default: []},
        deviceType: {
            type: String, trim: true, enum: deviceType
        },

        deviceToken: {type: String},
        userType: {type: String, enum: userTypeEnum, default: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER},

        lat: {type: Number},
        long: {type: Number},
        zipCode: {type: String},
        address: {type: String, trim: true},
        followers: {type: Number, default: 0},
        followings: {type: Number, default: 0},
        parentId: {
            type: Schema.Types.ObjectId,
            ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            default: null,
            index: true
        },

        isVerified: {type: Boolean, default: false},
        goLive: {type: Boolean, default: false},
        maintenance: {type: Boolean, default: false},
        isAdminVerified: {type: Boolean, default: false},
        autoRenewal: {type: Boolean, default: false},
        status: {type: String, index: true, enum: statusEnum, default: statusEnum[0]},
        adminUpdateId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
        adminCreateId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN},
        createdDate: {
            type: Number,
            default: +new Date(), required: true, index: true
        },
        closedAt:{
            type: Number
        },
        issuedAt: {
            type: Number,
            default: 0, required: false, index: true
        },
        resetPasswordExpiry: {
            type: Number,
            default: 0, required: false, index: true
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

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, vendors);
