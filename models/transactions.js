'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

// constructor
const Schema = mongoose.Schema;
const paymentStatusEnum = [
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.PRE_AUTHORIZED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
    APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
];
const refundStatus = [
    APP_CONSTANTS.REFUND_STATUS.COMPLETED,
    APP_CONSTANTS.REFUND_STATUS.INITIATED,
    APP_CONSTANTS.REFUND_STATUS.REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
    APP_CONSTANTS.REFUND_STATUS.REJECTED,
    APP_CONSTANTS.REFUND_STATUS.CANCELLED
];
const deviceType = [
    APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
    APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
];
let Transactions = new Schema(
    {
        user: {type: Schema.Types.ObjectId, refPath: APP_CONSTANTS.DATABASE.MODELS_NAME.USER},
        vendor: {type: Schema.Types.ObjectId, refPath: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS},
        creditId: {type: Schema.Types.ObjectId, refPath: APP_CONSTANTS.DATABASE.MODELS_NAME.CREDIT_MANAGEMENT},
        subscriptionLogId: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS},
        plan: {type: Schema.Types.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS},
        transactionType: {
            type: String, enum: [
                APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
                APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                APP_CONSTANTS.TRANSACTION_TYPES.WALLET,
                APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES, 
                APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES, 
                APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES, 
                APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                APP_CONSTANTS.TRANSACTION_TYPES.REDEEM_VOUCHER,
                APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION 
            ]
        },
        type: {
            type: String, enum: [
                APP_CONSTANTS.CREDIT_TYPE.CREDIT,
                APP_CONSTANTS.CREDIT_TYPE.DEBIT,
                APP_CONSTANTS.CREDIT_TYPE.POINTS,
                APP_CONSTANTS.CREDIT_TYPE.LIMIT_CHANGE,
                APP_CONSTANTS.CREDIT_TYPE.PROCESSING,
                APP_CONSTANTS.CREDIT_TYPE.FAILED
            ]
        },
        orderId: {type: Schema.Types.ObjectId, index: true},
        orderNumber: {type: String},
        invoiceNumber: {type: String},
        subTotal: {type: Number, default: 0},
        refundReason: {type: String, default: ''},
        selectedReason: {type: String, ref: APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON},
        tax: {type: Number, default: 0},
        
        deliveryCharges: {type: Number, default: 0},
        
        adminCharges: {type: Number, default: 0},
        
        finalTotal: {type: Number, default: 0},
        
        shippingCharges: {type: Number, default: 0},
        conversion: {type: Number, default: 0},
        currencySelected: {type: String, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},

        shippingChargesAfterDiscount: {type: Number, default: 0},
        
        shippingChargesDiscount: {type: Number, default: 0},
        
        paymentMethodCharge: {type: Number, default: 0},
        
        paymentMethodChargePercentage: {type: Number, default: 0},
        productPaymentMethodChargeTotal: {type: Number, default: 0},
        
        productShippingChargeTotal: {type: Number, default: 0},
        
        productPaymentMethodCharge: {type: Number, default: 0},
        productPaymentMethodChargePercentage: {type: Number, default: 0},
        
        promoCharges: {type: Number, default: 0},
        
        paymentMethod: {type: String},
        discountCode: {type: String},
        discountId: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO, index: true, required: false},
        voucherCode: {type: String},
        voucher: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO},
        
        amount: {type: Number, default: 0},
        
        amountWithTax: {type: Number, default: 0},
        
        productPriceWithTax: {type: Number, default: 0},
        
        productPromoCharges: {type: Number, default: 0},
        
        currency: {type: String, trim: true, default: APP_CONSTANTS.APP.DEFAULT_CURRENCY},
        paymentId: {type: String},
        status: {
            type: String, enum: paymentStatusEnum,
            default: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING
        },
        pId: {type: String},
        transactionId: {type: String},
        refundStatus: {
            type: String,
            enum: refundStatus,
            default: APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
        },
        pt_customer_email: {type: String},
        pt_customer_password: {type: String},
        pt_token : {type: String},
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
        rejectReason: {type: String},
        vendorOrderId: {type: Schema.Types.ObjectId, index: true},        // Ref to orderId in order table generated same for all order for same cart
        
        adminProductCharges: {type: Number, default: 0},
        
        productTotalTax: {type: Number, default: 0},
        
        productTax: {type: Number, default: 0},
        ///////////////////////////////////////

        // Price for each product for which order is created /////
        productPrice: {type: Number, default: 0},
        
        // Prices is USD

        // subTotalInUSD: {type: Number, default: 0},
        // taxInUSD: {type: Number, default: 0},
        // productPriceInUSD: {type: Number, default: 0},
        // productTaxInUSD: {type: Number, default: 0},
        // productTotalTaxInUSD: {type: Number, default: 0},
        // adminProductChargesInUSD: {type: Number, default: 0},
        // productPromoChargesInUSD: {type: Number, default: 0},
        // productPriceWithTaxInUSD: {type: Number, default: 0},
        // amountWithTaxInUSD: {type: Number, default: 0},
        // amountInUSD: {type: Number, default: 0},
        // promoChargesInUSD: {type: Number, default: 0},
        // productPaymentMethodChargeInUSD: {type: Number, default: 0},
        // productShippingChargeTotalInUSD: {type: Number, default: 0},
        // productPaymentMethodChargeTotalInUSD: {type: Number, default: 0},
        // paymentMethodChargeInUSD: {type: Number, default: 0},
        // shippingChargesDiscountInUSD: {type: Number, default: 0},
        // shippingChargesAfterDiscountInUSD: {type: Number, default: 0},
        // finalTotalInUSD: {type: Number, default: 0},
        // shippingChargesInUSD: {type: Number, default: 0},
        // adminChargesInUSD: {type: Number, default: 0},
        // deliveryChargesInUSD: {type: Number, default: 0},
        ////////////
        deviceType: {
            type: String, trim: true, enum: deviceType, default: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
        },

        transferred: {type: Boolean, default: false},
        quantity: {type: Number, default: 1},
        /////////////////////////////////////
        order: {type: Schema.ObjectId, ref: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS, index: true},  // Ref to _id in order table for all different order for vendor
        referenceNo: {type: String},
        createdDate: {type: Number, default: +new Date()},
        deliveredDate: {type: Number, default: 0},
        updatedDate: {type: Number, default: +new Date()},
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });
module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.TRANSACTIONS, Transactions);
