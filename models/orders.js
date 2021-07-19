'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

const Schema = mongoose.Schema;
// const status
const statusEnum = [
    APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
    APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURN_IN_PROGRESS,
    APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD,
    APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY,
    APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY,
    APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE,
    APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_CANCELLED,
    APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED,
];

const refundStatus = [
    APP_CONSTANTS.REFUND_STATUS.COMPLETED,
    APP_CONSTANTS.REFUND_STATUS.INITIATED,
    APP_CONSTANTS.REFUND_STATUS.REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.REJECTED,
    APP_CONSTANTS.REFUND_STATUS.CANCELLED
];

const paymentStatusEnum = [
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PRE_AUTHORIZED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
];
// constructor

let productModel = {
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true},
    product: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS, index: true},
    size: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    color: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, index: true},
    productVariant: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS, index: true},
    quantity: {type: Number, default: 1},
    
    price: {type: Number, default: 0},
    
    tax: {type: Number, default: 0},

    shippingChargesAfterDiscount: {type: Number, default: 0},

    promoCharges: {type: Number, default: 0},

    shippingCharges: {type: Number, default: 0},

    shippingChargesDiscount: {type: Number, default: 0},
    shippingChargesDiscountPercentage: {type: Number, default: 0},

    paymentMethodCharge: {type: Number, default: 0},

    paymentMethodChargePercentage: {type: Number, default: 0},
    currency: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},

    // promoChargesInUSD: {type: Number, default: 0},
    // priceInUSD: {type: Number, default: 0},
    // shippingChargesAfterDiscountInUSD: {type: Number, default: 0},
    // shippingChargesInUSD: {type: Number, default: 0},
    // shippingChargesDiscountInUSD: {type: Number, default: 0},
    // paymentMethodChargeInUSD: {type: Number, default: 0},


};

let logs = {
    status: {type: String, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date()},
    actionBy: {type: Schema.Types.ObjectId, refPath: 'logs.actionByModel', index: true, sparse: true},
    actionByModel: {type: String},
    userType: {type: String}
};

const deviceType = [
    APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
];

let ContactDetails = {
    phoneNo: {type: String, trim: true, index: true},
    countryCode: {type: String, trim: true, index: true},
    ISO: {type: String, default: ''},
};
let PickupDetails = {
    "ReadyTime": {type: String, trim: true, index: true},
    "CloseTime":  {type: String, trim: true, index: true},
    "SpecialInstructions":  {type: String, trim: true, index: true}
};

// constructor

const userAddress = new Schema({
    name: {type: String, trim: true},
    contactDetails: ContactDetails,
    zipCode: {type: String, trim: true, index: true, default: ""},
    street: {type: String, trim: true},
    building: {type: String, trim: true},
    state: {type: String, default: '', trim: true},
    country: {type: String, default: '', trim: true},
    // countryId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES, trim: true},
    city: {type: String, default: '', trim: true},
    lat: {type: Number, default: 0},
    long: {type: Number, default: 0},
    latLong: {type: [Number], index: '2dsphere'},
});


let Order = new Schema({
    user: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.USER, index: true, required: true},
    vendor: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS, index: true, required: true},
    cart: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.CART, index: true, required: false},
    vendorOrderId: {type: Schema.ObjectId},
    orderId: {type: Schema.ObjectId},
    orderNumber: {type: String},
    subOrderNumber: {type: String},
    discountValueType: {type: String},
    discountCode: {type: String},
    productNumber: {type: String},
    discountId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO, index: true, required: false},
    returnRequested: {type: Boolean, default: false},
    trackingId: {type: String, default: ""},
    trackingStatus: {type: String},
    trackingStatusCode: {type: String},
    courierType: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES},
    noDelivery: {type: Boolean},
    nonRefundable: {type: Boolean, default: false},
    cancellationReason: {type: String},
    trackingUrl: {type: String, default: ""},
    finalSubOrderNumber: {type: String},
    products: productModel,
    processingTill: {type: Number, default: 0},
    subTotal: {type: Number, default: 0},
    
    tax: {type: Number, default: 0},

    deliveryCharges: {type: Number, default: 0},

    discountValue: {type: Number, default: 0},
    promoCharges: {type: Number, default: 0},

    shippingCharges: {type: Number, default: 0},

    shippingChargesAfterDiscount: {type: Number, default: 0},

    shippingChargesDiscount: {type: Number, default: 0},

    paymentMethodCharge: {type: Number, default: 0},

    deliveryAddress: userAddress,
    billingAddress: userAddress,
    rejectReason: {type: String},
    finalTotal: {type: Number, default: 0},
    conversion: {type: Number, default: 0},
    deviceType: {
        type: String, trim: true, enum: deviceType, default: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
    },
    currency: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    currencySelected: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
    status: {
        type: String, enum: statusEnum,
        default: APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED
    },
    paymentStatus: {
        type: String, enum: paymentStatusEnum,
        default: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
    },
    refundStatus: {
        type: String,
        enum: refundStatus,
        default: APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
    },
    refundQuantity: {
        type: Number,
        default: 0
    },
    productRefundAmount: {
        type: Number,
        default: 0 
    },
    refundAmount: {
        type: Number,
        default: 0 
    },
    pId: {type: String},
    transactionId: {type: String},
    invoiceNumber: {type: String},
    labelURL: {type: String},
    labelURLReturn: {type: String},
    deliveryInstructions: {type: String, default: ""},
    goodDescription: {type: String, default: ""},
    pickupDetails: PickupDetails,
    referenceNo: {type: String},
    trackingIdReturn: {type: String, default: ""},
    trackingStatusReturn: {type: String},
    trackingStatusCodeReturn: {type: String},
    trackingLogsReturn: {},
    trackingLogs: {},
    courierCompany: {type: String},
    returnStatus: {
        type: String,
        enum: statusEnum
    },
    refundReason: {type: String, default: ''},
    selectedReason: {type: String, ref: APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON},
    externalUrl: {type: String, default: ""},
    paymentMethod: {
        type: String, enum: [
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET
        ], default: APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY
    },

    // Prices in USD
    // subTotalInUSD: {type: Number, default: 0},
    // taxInUSD: {type: Number, default: 0},
    // deliveryChargesInUSD: {type: Number, default: 0},
    // finalTotalInUSD: {type: Number, default: 0},
    // promoChargesInUSD: {type: Number, default: 0},
    // paymentMethodChargeInUSD: {type: Number, default: 0},
    // shippingChargesDiscountInUSD: {type: Number, default: 0},
    // shippingChargesAfterDiscountInUSD: {type: Number, default: 0},
    // shippingChargesInUSD: {type: Number, default: 0},
    // Prices in USD


    logs: [logs],
    deliveredDate: {type: Number, default: 0},
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, Order);
