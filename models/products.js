"use strict";

// npm module
const mongoose = require("mongoose");

// Schema constructor object
const Schema = mongoose.Schema;
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
    APP_CONSTANTS.STATUS_ENUM.PENDING,
    APP_CONSTANTS.STATUS_ENUM.FOR_REVIEW,
];

const shippingChargesType = [
    APP_CONSTANTS.SHIPPING_CHARGES_TYPE.FREE,
    APP_CONSTANTS.SHIPPING_CHARGES_TYPE.FIXED,
];
const shippingType = [
    APP_CONSTANTS.SHIPPING_TYPE.LOCAL,
    APP_CONSTANTS.SHIPPING_TYPE.EVERYWHERE_ELSE,
];

const shippingDetails = {
    type: {type: String, enum: shippingType},
    shippingCourier: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    shippingChargesType: {type: String, enum: shippingChargesType},
    shippingCharges: {type: Number, default: 0},
    addedInPrice: {type: Boolean, default: false},
    currency: {type: String, default: ""}
}

const shippingObj = {
    origin: {type: String, default: ""},
    processingTime: {type: String, default: ""},
    shippingDetail: [shippingDetails]
};

const Products = new Schema({
    // doc feature fields
    title: {},
    description: {},
    externalUrl: {type: String, trim: true},

    vendor: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        sparse: true,
        required: true
    },

    addedBy: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        sparse: true,
        required: true
    },
    updatedBy: {
        type: Schema.ObjectId,
        index: true,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
        sparse: true,
        required: true
    },
    productNumber: {type: String, default: ""},
    weight: {type: String, default: ""},
    unit: {type: String, default: ""},
    material: {type: String, default: ""},
    brand: {type: String, default: ""},
    volume: {type: String, default: ""},
    shelfLife: {type: String, default: ""},
    storageTemperature: {type: String, default: ""},
    certification: {type: String, default: ""},
    variantsAvailable: {type: Boolean, default: false},
    // colors: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    colors: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    quantityAvailable: {type: Number, default: 0},
    // sizes: {type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    sizes: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    sizesArray :{type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    discount: {type: Number, default: 0},
    tax: {type: Number, default: 0},
    productType: {
        type: String, enum: [
            APP_CONSTANTS.PRODUCT_TYPE.TRADING,
            APP_CONSTANTS.PRODUCT_TYPE.NON_TRADING,
        ]
    },
    productTangibleType: {
        type: String, enum: [
            APP_CONSTANTS.PRODUCT_TANGIBLE_TYPE.TANGIBLE,
            APP_CONSTANTS.PRODUCT_TANGIBLE_TYPE.DIGITAL,
        ]
    },
    price: {type: Number, default: 0},
    priceInUSD: {type: Number, default: 0},
    priceInAED: {type: Number, default: 0},
    productCost: {type: Number, default: 0},
    productCostInUSD: {type: Number, default: 0},
    productCostInAED: {type: Number, default: 0},
    profit: {type: Number, default: 0},
    profitInUSD: {type: Number, default: 0},
    profitInAED: {type: Number, default: 0},
    profitPercentage: {type: Number, default: 0},
    currency: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    isAdminVerified: {type: Boolean, default: false},
    nonRefundable: {type: Boolean, default: false},
    productTag: {type: String, default: ""},
    length: {type: Number, default: 0},
    breadth: {type: Number, default: 0},
    height: {type: Number, default: 0},
    cubicWeight: {type: Number, default: 0},
    shippingChargesInUSD:  {type: Number, default: 0},
    shippingChargestInAED: {type: Number, default: 0},
    category: {
        type: Schema.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: false
    },
    collectionId: {
        type: Schema.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: false
    },
    subCategory: {
        type: Schema.ObjectId,
        ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES,
        sparse: true,
        required: false
    },
    productVariants: {
        type: [Schema.ObjectId], ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS
    },
    shipping: shippingObj,
    images: [UniversalFunctions.mediaSchema],
    videos: [UniversalFunctions.mediaSchema],
    shippingCharges: {type: Number, default: 0},
    availableForSale: {type: Boolean, default: false},
    popularity: {type: Number, default: 0},
    visits: {type: Number, default: 0},
    dailyVisits: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    dailyLikes: {type: Number, default: 0},
    rating: {type: Number, default: 0},
    noOfRating: {type: Number, default: 0},
    soldOut: {type: Boolean, default: false},
    refundable: {type: Boolean, default: false},
    orderCount: {type: Number, default: 0},
    // status doc field
    status: {type: String, required: true, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.PENDING},

    // doc time log fields
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, Products);
