// npm modules
const joi = require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');
module.exports = {
    LOGIN: {
        vendorId: joi.string().allow(""),
        countryCode: joi.string().optional().trim().description('with +'),
        phoneNumber: joi.string().optional().trim(),
        email: joi.string().email().trim().lowercase(),
        password: joi.string().required().trim(),
        deviceToken: joi.string().allow(''),
        // deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB])
    },
    LOGIN_2: {
        vendorId: joi.string().allow(""),
        countryCode: joi.string().optional().trim().description('with +'),
        phoneNumber: joi.string().optional().trim(),
        email: joi.string().email().trim().lowercase(),
        password: joi.string().trim(),
        deviceToken: joi.string().allow(''),
        data: joi.string()
    },
    VERIFY_ACCOUNT: {
        vendorId: joi.string().allow(""),
        OTP: joi.string().required(),
        countryCode: joi.string().required().trim().description('with +'),
        phoneNumber: joi.string().required().trim(),
    },
    RESEND_OTP: {
        vendorId: joi.string().allow(""),
        countryCode: joi.string().required().trim().description('with +'),
        phoneNumber: joi.string().required().trim(),
    },
    FORGOT_PASSWORD: {
        vendorId: joi.string().allow(""),
        email: joi.string().email().required().lowercase(),
    },
    RESET_PASSWORD: {
        id: joi.string().required(),
        vendorId: joi.string().allow(""),
        resetPasswordExpiry: joi.number().required(),
        password: joi.string().required()
    },
    CHANGE_PASSWORD: {
        vendorId: joi.string().allow(""),
        oldPassword: joi.string().required(),
        newPassword: joi.string().required()
    },
    CHECK_VENDOR: {
        vendorId: joi.string().allow(""),
        vendorRegisterName: joi.string().optional().allow(""),
        email: joi.string().optional().allow("").lowercase(),
        countryCode: joi.string().optional().allow(""),
        phoneNumber: joi.string().optional().allow(""),
    },
    SELECT_TEMPLATE: {
        vendorId: joi.string().length(24).allow(""),
        template: joi.string(),
        images: joi.array().items(UniversalFunctions.mediaAuth),
        banner: UniversalFunctions.mediaAuth,
        currency: joi.string().optional(),
        country: joi.string().length(24).optional(),
        vendorRegisterName: joi.string().optional().trim(),
        ownerBio: joi.string(),
        businessDescription: joi.string(),
        ownerPicture: UniversalFunctions.mediaAuth,
    },
    GET_PROFILE: {
        vendorId: joi.string().length(24).allow(""),
    },
    STEP_2: {
        vendorId: joi.string().length(24).allow(""),
        headerColor: joi.string().optional(),
        headerTextColor: joi.string().optional(),
        headerBackground: UniversalFunctions.mediaAuth,
        collections: joi.array().items(
            joi.object().keys({
                _id: joi.string().length(24).allow(''),
                name: joi.object(),
                media: joi.array().items(UniversalFunctions.mediaAuth),
                type: joi.string().default(APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS).valid([APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS])
            })
        ).allow([]),
        deletedCollections: joi.array().items(
            joi.string().length(24)
        ).allow([])
    },
    STEP_3: {
        vendorId: joi.string().length(24).allow(""),
        collectionId: joi.string().length(24).required(),
        products: joi.array().items(
            joi.string().length(24)
        )
    },
    STEP_4: {
        vendorId: joi.string().length(24).allow(""),
        members: joi.array().items(
            joi.object().keys({
                _id: joi.string().allow(""),
                name: joi.string(),
                email: joi.string(),
                position: joi.string()
            })
        ).allow([]),
        deletedMembers: joi.array().items(
            joi.string().length(24)
        ).allow([]),
        socialLinks: joi.array().items(
            joi.object().keys({
                type: joi.string().allow(""),
                link: joi.string().allow("")
            })
        ).allow([]),
        marketingVideo: UniversalFunctions.mediaAuth,
        vendorStory: joi.string(),
        vendorAdImage: UniversalFunctions.mediaAuth,
        vendorAdVideo: UniversalFunctions.mediaAuth,
        name: joi.string().allow(""),
        firstName: joi.string().allow(""),
        lastName: joi.string().allow(""),
        vendorPolicy: joi.string().allow(""),
        inheritPolicy: joi.boolean().allow("").valid([true, false]),
        vendorAd: joi.string().allow(""),
        saleContact: joi.object().keys({
            phoneNo: joi.string(),
            countryCode: joi.string(),
            ISO: joi.string(),
        })
    },
    STEP_5: {
        vendorId: joi.string().length(24).allow(""),
        goLive: joi.boolean().valid([true, false]).required(),
    },
    SIGNUP: {
        vendorId: joi.string().allow(""),
        countryCode: joi.string().required().trim().description('with +'),
        vendorRegisterName: joi.string().required(),
        name: joi.string().optional().trim().allow(""),
        firstName: joi.string().optional().trim().allow(""),
        lastName: joi.string().optional().trim().allow(""),
        phoneNumber: joi.string().required().trim(),
        email: joi.string().email().required().trim().lowercase(),
        password: joi.string().required().trim(),
        country: joi.string().length(24).optional().allow(""),
        lat: joi.number(),
        long: joi.number(),
        address: joi.string().allow(""),
        currency: joi.string().allow(""),
        vendorSize: joi.string().length(24).allow(""),
        vendorPurpose: joi.string().valid([APP_CONSTANTS.VENDOR_PURPOSE.TRADING, APP_CONSTANTS.VENDOR_PURPOSE.EXPANSION, APP_CONSTANTS.VENDOR_PURPOSE.GALLERY]).default(APP_CONSTANTS.VENDOR_PURPOSE.TRADING),
        ISO: joi.string().when('signUpBy', {
            is: APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.PHONE_NUMBER,
            then: joi.string().required().trim(), otherwise: joi.optional().allow('')
        }).description('send in case of phone Number signup'),
        deviceToken: joi.string().allow(''),
        language: joi.string().description("en", "ar"),
        // deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB])
    },
    UPDATE_STATUS: {
        vendorId: joi.string().length(24).allow(""),
        status: joi.string().valid([APP_CONSTANTS.VENDOR_STATUS.ON_AIR, APP_CONSTANTS.VENDOR_STATUS.OFF_AIR, APP_CONSTANTS.VENDOR_STATUS.CLOSED]).required()
    },
    AUTO_RENEWAL: {
        vendorId: joi.string().length(24).allow(""),
        autoRenewal: joi.boolean().required()
    },
    NOTIFICATION_LISTING: {
        vendorId: joi.string().length(24).allow(""),
        skip: joi.number(),
        limit: joi.number(),
    },
    EDIT_PROFILE: {
        vendorId: joi.string().allow(""),
        name: joi.string().optional().allow(""),
        firstName: joi.string().optional().allow(""),
        lastName: joi.string().optional().allow(""),
        phoneNumber: joi.string().optional().trim(),
        countryCode: joi.string().optional().allow(""),
        ISO: joi.string().optional().allow(""),
        selectedNotificationType: joi.array().items(joi.string().valid([APP_CONSTANTS.NOTIFICATION_SELECTION.SMS, APP_CONSTANTS.NOTIFICATION_SELECTION.EMAIL, APP_CONSTANTS.NOTIFICATION_SELECTION.NOTIFICATION])),
        country: joi.string().length(24).optional().allow(""),
        vendorPurpose: joi.string().valid([APP_CONSTANTS.VENDOR_PURPOSE.TRADING, APP_CONSTANTS.VENDOR_PURPOSE.EXPANSION, APP_CONSTANTS.VENDOR_PURPOSE.GALLERY]),
        email: joi.string().email().optional().trim().lowercase().allow(""),
        vendorRegisterName: joi.string().optional().trim().allow(""),
        ownerId: UniversalFunctions.mediaAuth,
        vendorSize: joi.string().length(24).allow(""),
        courierService: joi.string().length(24).allow(""),
        webExternalUrl: joi.string().allow(""),
        noDelivery: joi.boolean(),
        coverageArea: joi.string().length(24).allow(""),
        monthlySale: joi.number(),
        lat: joi.number(),
        long: joi.number(),
        address: joi.string().allow(""),
        ownerBio: joi.string().allow(""),
        businessDescription: joi.string().allow(""),
        bankDetails: joi.object().keys({
            iban: joi.string(),
            country: joi.string(),
            name: joi.string(),
        }),
        availabilityForTrade: UniversalFunctions.mediaAuth,
        license: UniversalFunctions.mediaAuth,
        passportCopy: UniversalFunctions.mediaAuth,
        selfieWithPassport: UniversalFunctions.mediaAuth,
        ownerPicture: UniversalFunctions.mediaAuth,
        category: joi.array().items(joi.string().length(24)),
        subCategory: joi.array().items(joi.string().length(24)),
        currency: joi.string().allow(""),
        language: joi.string().description("en", "ar").allow(""),
        courierService: joi.string().length(24).allow(""),
        webUrl: joi.boolean(),
        tradingAuthorized: joi.boolean()
    },
    SIGN_UP_V2:{
        vendorId: joi.string().allow(""),
        countryCode: joi.string().required().trim().description('with +'),
        vendorRegisterName: joi.string().required(),
        name: joi.string().optional().trim().allow(""),
        firstName: joi.string().optional().trim().allow(""),
        lastName: joi.string().optional().trim().allow(""),
        phoneNumber: joi.string().required().trim().allow(""),
        email: joi.string().email().required().trim().lowercase(),
        password: joi.string().required().trim(),
        country: joi.string().length(24).optional().allow(""),
        lat: joi.number(),
        long: joi.number(),
        address: joi.string().allow(""),
        currency: joi.string().allow(""),
        vendorSize: joi.string().length(24).allow(""),
        vendorPurpose: joi.string().valid([APP_CONSTANTS.VENDOR_PURPOSE.TRADING, APP_CONSTANTS.VENDOR_PURPOSE.EXPANSION, APP_CONSTANTS.VENDOR_PURPOSE.GALLERY]).default(APP_CONSTANTS.VENDOR_PURPOSE.TRADING),
        ISO: joi.string().when('signUpBy', {
            is: APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.PHONE_NUMBER,
            then: joi.string().required().trim(), otherwise: joi.optional().allow('')
        }).description('send in case of phone Number signup'),
        deviceToken: joi.string().allow(''),
        language: joi.string().description("en", "ar"),
        ownerId: UniversalFunctions.mediaAuth,
        courierService: joi.string().length(24).allow(""),
        coverageArea: joi.string().length(24).allow(""),
        monthlySale: joi.number(),
        webUrl: joi.boolean().default(false),
        tradingAuthorized: joi.boolean().default(false),
        webExternalUrl: joi.string().allow(""),
        ownerBio: joi.string().allow(""),
        businessDescription: joi.string(),
        bankDetails: joi.object().keys({
            iban: joi.string(),
            country: joi.string(),
            name: joi.string(),
        }),
        availabilityForTrade: UniversalFunctions.mediaAuth,
        license: UniversalFunctions.mediaAuth,
        passportCopy: UniversalFunctions.mediaAuth,
        selfieWithPassport: UniversalFunctions.mediaAuth,
        ownerPicture: UniversalFunctions.mediaAuth,
        category: joi.array().items(joi.string().length(24)),
        subCategory: joi.array().items(joi.string().length(24)),
    },
    DASHBOARD: {
        isCSV: joi.boolean().allow("").valid([true, false]),
        vendorId: joi.string().length(24).allow(""),
        startDate: joi.number().optional(),
        endDate: joi.number().optional(),
    },
    ANALYTICS_DATA: {
        isCSV: joi.boolean().allow("").valid([true, false]),
        vendorId: joi.string().length(24).allow(""),
        startDate: joi.number().optional(),
        endDate: joi.number().optional(),
        graphType: joi.string().valid([
            APP_CONSTANTS.GRAPH_TYPE.WEEKLY,
            APP_CONSTANTS.GRAPH_TYPE.DAILY,
            APP_CONSTANTS.GRAPH_TYPE.YEARLY,
            APP_CONSTANTS.GRAPH_TYPE.MONTHLY,
        ]),
        type: joi.string().required().valid([
            APP_CONSTANTS.ANALYTICS_TYPE.ORDERS,
            APP_CONSTANTS.ANALYTICS_TYPE.EARNING,
            APP_CONSTANTS.ANALYTICS_TYPE.PRODUCTS,
            APP_CONSTANTS.ANALYTICS_TYPE.DASHBOARD,
            APP_CONSTANTS.ANALYTICS_TYPE.DASHBOARD_PRODUCT
        ])
    },
    SALES_REPORTS: {
        vendorId: joi.string().length(24).allow(""),
        startDate: joi.number().optional(),
        endDate: joi.number().optional(),
        graphType: joi.string().valid([
            APP_CONSTANTS.GRAPH_TYPE.WEEKLY,
            APP_CONSTANTS.GRAPH_TYPE.DAILY,
            APP_CONSTANTS.GRAPH_TYPE.YEARLY,
            APP_CONSTANTS.GRAPH_TYPE.MONTHLY,
        ])
    },
    ADD_EDIT_BANK: {
        vendorId: joi.string().length(24).allow(""),
        _id: joi.string().allow(""),
        bankName: joi.string().required(),
        accountHolderName: joi.string().required(),
        accountNumber: joi.string().required(),
        iBanNumber: joi.string().required(),
        swiftCode: joi.string().required(),
        default: joi.boolean().valid([true, false]),
    },
    DELETE_BANK: {
        vendorId: joi.string().length(24).allow(""),
        bankId: joi.string().length(24)
    },
    
    DELETE_SUB_VENDOR: {
        vendorId: joi.string().length(24)
    },
    ADD_OR_EDIT_SUB_VENDOR: {
        vendorId: joi.string().length(24),
        vendorRegisterName: joi.string()
    },
    LIST_SUB_VENDOR: {
        _id: joi.string().allow(""),
        skip: joi.number(),
        limit: joi.number()
    },
    MAKE_DEFAULT_BANK: {
        vendorId: joi.string().length(24).allow(""),
        bankId: joi.string().length(24)
    },
    UPDATE_THEME: {
        vendorId: joi.string().length(24).allow(""),
        themeType: joi.string().required()
    },
    LIST_BANKS: {
        vendorId: joi.string().length(24).allow(""),
        skip: joi.number(),
        limit: joi.number()
    },
    EARNING_LISTING: {
        vendorId: joi.string().length(24).allow(""),
        type: joi.string().required().valid([
            APP_CONSTANTS.TRANSACTION_LISTING.ALL,
            APP_CONSTANTS.TRANSACTION_LISTING.RECEIVED,
            APP_CONSTANTS.TRANSACTION_LISTING.DEDUCTED,
            APP_CONSTANTS.TRANSACTION_LISTING.DUE_PAYMENT,
            APP_CONSTANTS.TRANSACTION_LISTING.WALLET_BALANCE,
        ]),
        transactionType: joi.string().valid([
            APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
            APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
            APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
            APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
            APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
            APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
        ]),
        transactionId: joi.string().allow(""),
        isCSV: joi.boolean().valid([true, false]),
        startDate: joi.number(),
        endDate: joi.number(),
        skip: joi.number(),
        limit: joi.number(),
    },
    SPECIAL_TRANSFER_REQUEST: {
        requiredOnDate: joi.number().optional(),
        transaction: joi.array().items(joi.string().length(24)),
        amount: joi.number().required()
    },
    CREATE_MANAGING_ACCOUNT: {
        vendorId: joi.string().allow(""),
        _id: joi.string().allow(""),
        email: joi.string().email().required(),
        vendorRegisterName: joi.string().allow(""),
        password: joi.string().optional(),
        permissions: joi.string().allow("")
    },
    USER_DETAILS: {
        id: joi.string().required(),
        type: joi.string().valid([APP_CONSTANTS.FEED_LIST_TYPE.USER, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR]).required()
    }
};
