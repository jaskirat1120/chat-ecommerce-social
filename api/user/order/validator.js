// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    ADD_TO_CART: {
        product: joi.string().length(24).required(),
        size: joi.string().length(24),
        color: joi.string().length(24),
        productVariant: joi.string().length(24),
        quantity: joi.number().min(1).required(),
    },
    UPDATE_CART: {
        cart: joi.string().length(24).required(),
        productId: joi.string().length(24).required(),
        size: joi.string().length(24),
        color: joi.string().length(24),
        productVariant: joi.string().length(24),
        quantity: joi.number().min(1).required(),
    },
    REMOVE_PRODUCT: {
        cart: joi.string().length(24).required(),
        productId: joi.string().length(24).required(),
        lastProduct: joi.boolean().valid([true, false]),
    },
    PLACE_ORDER: {
        cart: joi.string().when('from', {
            is: APP_CONSTANTS.ORDER_FROM.CART,
            then: joi.string().length(24).required().trim(), otherwise: joi.optional().allow('')
        }),
        subTotal: joi.number().required(),
        tax: joi.number().required(),
        shippingCharges: joi.number().optional().default(0),
        promoCharges: joi.number().optional().default(0),
        discountCode: joi.string().allow(""),
        discountValue: joi.number().optional().default(0),
        discountValueType: joi.string().allow(""),
        discountId: joi.string().allow("").length(24),
        shippingChargesDiscount: joi.number().optional().default(0),
        shippingChargesAfterDiscount: joi.number().optional().default(0),
        deliveryCharges: joi.number().required(),
        finalTotal: joi.number().required(),
        conversion: joi.number().optional(),
        currency: joi.string().default(APP_CONSTANTS.APP.DEFAULT_CURRENCY),
        currencySelected: joi.string().default(APP_CONSTANTS.APP.DEFAULT_CURRENCY),
        deliveryAddress: joi.object().keys({
            _id: joi.string().allow(""),
            name: joi.string().required(),
            contactDetails: joi.object().keys({
                phoneNo: joi.string().required(),
                countryCode: joi.string().required(),
                ISO: joi.string().optional(),
            }).required(),
            // zipCode: joi.string().required(),
            street: joi.string().required(),
            default: joi.boolean(),
            building: joi.string().required(),
            state: joi.string().required(),
            country: joi.string().required(),
            countryId: joi.any().optional(),
            city: joi.string().required(),
            lat: joi.number().optional(),
            long: joi.number().optional(),
            status: joi.any(),
            createdDate: joi.any(),
            updatedDate: joi.any(),
            createdAt: joi.any(),
            updatedAt: joi.any(),
            __v: joi.any(),
            user: joi.any(),
            saveForFuture: joi.boolean().optional().default(false).valid([true, false])
        }).required(),
        billingAddress: joi.object().keys({
            _id: joi.string().allow(""),
            sameAsDelivery: joi.boolean().default(true).valid([true, false]),
            name: joi.string().required(),
            default: joi.boolean(),
            contactDetails: joi.object().keys({
                phoneNo: joi.string().required(),
                countryCode: joi.string().required(),
                ISO: joi.string().optional(),
            }),
            // zipCode: joi.string().required(),
            street: joi.string().required(),
            building: joi.string().required(),
            state: joi.string().required(),
            country: joi.string().required(),
            countryId: joi.any().optional(),
            city: joi.string().required(),
            lat: joi.number().optional(),
            long: joi.number().optional(),
            status: joi.any(),
            createdDate: joi.any(),
            updatedDate: joi.any(),
            createdAt: joi.any(),
            updatedAt: joi.any(),
            __v: joi.any(),
            user: joi.any(),
            saveForFuture: joi.boolean().optional().default(false).valid([true, false])
        }).required(),
        paymentMethod: joi.string().valid([
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY,
            APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET
        ]).required(),
        from: joi.string().valid([APP_CONSTANTS.ORDER_FROM.CART, APP_CONSTANTS.ORDER_FROM.DIRECT]).required(),
        products: joi.array().items(
            joi.object().keys({
                product: joi.string().required(),
                _id: joi.string().optional().allow(""),
                size: joi.string().length(24),
                color: joi.string().length(24),
                productVariant: joi.string().length(24),
                quantity: joi.number().min(1).required(),
                vendor: joi.string().length(24),
                price: joi.number().required(),
                tax: joi.number().required(),
                shippingCharges: joi.number().optional().default(0),
                promoCharges: joi.number().optional().default(0),
                shippingChargesDiscount: joi.number().optional().default(0),
                shippingChargesAfterDiscount: joi.number().optional().default(0),
                shippingChargesDiscountPercentage: joi.number().optional().default(0),
                currency: joi.string().default(APP_CONSTANTS.APP.DEFAULT_CURRENCY)
            })
        )
    },
    ADD_EDIT_ADDRESS: {
        _id: joi.string().allow(""),
        name: joi.string().required(),
        contactDetails: joi.object().keys({
            phoneNo: joi.string().required(),
            countryCode: joi.string().required(),
            ISO: joi.string().optional(),
        }),
        // zipCode: joi.string().required(),
        street: joi.string().required(),
        building: joi.string().required(),
        state: joi.string().required(),
        country: joi.string().required(),
        countryId: joi.string().optional(),
        city: joi.string().required(),
        lat: joi.number().optional(),
        long: joi.number().optional(),

    },
    LIST_ORDERS: {
        status: joi.string().valid([
            APP_CONSTANTS.LIST_ORDER_STATUS.ALL,
            APP_CONSTANTS.LIST_ORDER_STATUS.OPEN,
            APP_CONSTANTS.LIST_ORDER_STATUS.CANCELLED,
            APP_CONSTANTS.LIST_ORDER_STATUS.RETURNED,
            APP_CONSTANTS.LIST_ORDER_STATUS.DELIVERED,
            APP_CONSTANTS.LIST_ORDER_STATUS.BUY_AGAIN,
        ]).default(APP_CONSTANTS.LIST_ORDER_STATUS.ALL),
        orderId: joi.string().length(24),
        _id: joi.string().length(24),
        skip: joi.number().default(0),
        limit: joi.number().default(10),
        startDate: joi.number(),
        endDate: joi.number(),
    },
    DELETE_ADDRESS: {
        addressId: joi.string().length(24)
    },
    MAKE_DEFAULT_ADDRESS: {
        addressId: joi.string().length(24)
    },
    CANCEL: {
        _id: joi.string().length(24).required(),
        cancellationReason: joi.string().required(),
    },
    REQUEST_REFUND: {
        order: joi.string().length(24).required(),
        media: joi.array().items(UniversalFunctions.mediaAuth),
        selectedReason: joi.string().allow("").length(24),
        refundReason: joi.string().allow(""),
        refundQuantity: joi.number()
    },
    CHECK_REQUEST_REFUND: {
        order: joi.string().length(24).required()
    },
    LIST_WISHLIST: {
        skip: joi.number(),
        limit: joi.number()
    },
    LIST_WALLET_TRANSACTION: {
        skip: joi.number(),
        limit: joi.number(),
        type: joi.string().valid([APP_CONSTANTS.CREDIT_TYPE.CREDIT, APP_CONSTANTS.CREDIT_TYPE.DEBIT])
    },
    ADD_TO_WISHLIST: {
        products: joi.object().keys({
            product: joi.string().required(),
            size: joi.string().length(24),
            color: joi.string().length(24),
            productVariant: joi.string().length(24),
            quantity: joi.number().min(1).required(),
            vendor: joi.string().length(24),
        }),
        cart: joi.string().allow(),
        productId: joi.string().allow(""),
        priority: joi.string().valid([
            APP_CONSTANTS.PRIORITY.HIGH,
            APP_CONSTANTS.PRIORITY.LOW,
            APP_CONSTANTS.PRIORITY.MEDIUM,
            APP_CONSTANTS.PRIORITY.HIGHEST
        ])
    },
    REMOVE_WISHLIST: {
        _id: joi.string().length(24),
        addToCart: joi.boolean().default(false),
    },
    INITIATE_RETURN: {
        _id: joi.string().length(24).required(),
        returnReason: joi.string()
    },
    RETRY_PAYMENT: {
        orderId: joi.string().length(24).required(),
    },
    ADD_MONEY_TO_WALLET: {
        amount: joi.number().required(),
        currencySelected: joi.string(),
        conversion: joi.number()
    },
    DOWNLOAD_INVOICE: {
        _id: joi.string().required(),
        currency: joi.string(),
        conversion: joi.number()
    },
    SHARE_GIFT_CARD: {
        giftCard: joi.string().length(24).required(),
        shareVia: joi.string().valid([
            APP_CONSTANTS.SHARE_VIA.MESSAGE,
            APP_CONSTANTS.SHARE_VIA.EMAIL,
        ]),
        shareWith: joi.string().length(24).required(),
        media: UniversalFunctions.mediaAuth
    },
    CHECK_SHIPPING: {
        products: joi.array().items(
            joi.object().keys({
                product: joi.string().required(),
                _id: joi.string().optional().allow(""),
                size: joi.string().length(24),
                color: joi.string().length(24),
                productVariant: joi.string().length(24),
                quantity: joi.number().min(1).required(),
                vendor: joi.string().length(24),
                price: joi.number().required(),
                tax: joi.number().required(),
                currency: joi.string().default(APP_CONSTANTS.APP.DEFAULT_CURRENCY)
            })
        ),
         deliveryAddress: joi.object().keys({
            _id: joi.string().allow(""),
            name: joi.string().required(),
            contactDetails: joi.object().keys({
                phoneNo: joi.string().required(),
                countryCode: joi.string().required(),
                ISO: joi.string().optional(),
            }).required(),
            // zipCode: joi.string().required(),
            street: joi.string().required(),
            default: joi.boolean(),
            building: joi.string().required(),
            state: joi.string().required(),
            country: joi.string().required(),
            countryId: joi.any().optional(),
            city: joi.string().required(),
            lat: joi.number().optional(),
            long: joi.number().optional(),
            status: joi.any(),
            createdDate: joi.any(),
            updatedDate: joi.any(),
            createdAt: joi.any(),
            updatedAt: joi.any(),
            __v: joi.any(),
            user: joi.any(),
            saveForFuture: joi.boolean().optional().default(false).valid([true, false])
        }).required(),
    },
    APPLY_PROMO: {
        code: joi.string().required(),
        cart: joi.string().length(24).required(),
        products: joi.array().items(
            joi.object().keys({
                product: joi.string().required(),
                _id: joi.string().optional().allow(""),
                size: joi.string().length(24),
                color: joi.string().length(24),
                productVariant: joi.string().length(24),
                quantity: joi.number().min(1).required(),
                vendor: joi.string().length(24),
                price: joi.number().required(),
                tax: joi.number().required(),
                promoCharges: joi.number().optional().default(0),
                currency: joi.string().default(APP_CONSTANTS.APP.DEFAULT_CURRENCY)
            })
        ),
    },
    REDEEM_VOUCHER: {
        code: joi.string().required(),
        password: joi.string().optional().allow("")
    }
};
