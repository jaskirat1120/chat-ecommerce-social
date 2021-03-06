// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    ADD_CATEGORY: {
        _id: joi.string().length(24),
        name: joi.object().description("{en:'Accessories',ar:'Accessories'}"),
        description: joi.object().description("{en:'Accessories',ar:'Accessories'}"),
        rank: joi.number(),
        media: joi.array().items(UniversalFunctions.mediaAuth),
        type: joi.string().default(APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES),
        parentId: joi.array().items(joi.string().length(24)),
        fontTypeName: joi.string().allow(""),
        fontSizeName:joi.string().allow(""),
        fontColorName:joi.string().allow(""),
        fontLocationName: joi.string().allow(""),
        fontTypeDescription: joi.string().allow(""),
        fontSizeDescription: joi.string().allow(""),
        fontColorDescription: joi.string().allow(""),
        fontLocationDescription: joi.string().allow(""),
    },
    ADD_CURRENCY: {
        currencyId: joi.string().length(24),
        from: joi.string().required(),
        to: joi.string().required(),
        conversion: joi.number().required(),
        reverseConversion: joi.number().required()
    },
    ADD_COMMON_SERVICE: {
        _id: joi.string().length(24),
        name: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        description: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        media: UniversalFunctions.mediaAuth,
        vendor: joi.array().items(joi.string().length(24)),
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE).description("Type of media"),
        courierServiceUrl: joi.string(),
        twitterUrl: joi.string(),
        googleUrl: joi.string(),
        facebookUrl: joi.string(),
        address: joi.string(),
        blogUrl: joi.string(),
        duration: joi.number(),
        courierServiceType: joi.string().valid([APP_CONSTANTS.COURIER_SERVICE_TYPE.SKYNET]),
        rank: joi.number(),

        designation: joi.string().allow(""),
        colorCode: joi.string().allow(""),
        fontTypeName: joi.string().allow(""),
        fontSizeName:joi.string().allow(""),
        fontColorName:joi.string().allow(""),
        days: joi.number().optional(),
        fontLocationName: joi.string().allow(""),
        fontTypeDescription: joi.string().allow(""),
        fontSizeDescription: joi.string().allow(""),
        fontColorDescription: joi.string().allow(""),
        fontLocationDescription: joi.string().allow(""),
        type: joi.string().valid([
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COURIER_SERVICE,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COVERAGE_AREA,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COLORS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.SIZES,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.INTERESTS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_ADMIN_AD,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_PAID_AD,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.TEAMS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.NEWS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CONTACT_US_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.SKILLS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.WHATS_NEW,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.LOCATIONS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.UPDATES,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.PROCESSING_TIME,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER_AREA,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COUNTRY]).default(APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE),
        inCoverageArea: joi.boolean().valid([true, false]),
        skill: joi.string(),
        location: joi.string(),
        careerArea: joi.string(),
        parentId: joi.string().length(24),
    },
    ADD_PLANS: {
        _id: joi.string().length(24),
        name: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        description: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        price: joi.number().optional(),
        managingAccounts: joi.number().optional(),
        localShippingCharges: joi.number().optional(),
        perKgPriceShipping: joi.number().optional(),
        discountAnnualSubscription: joi.number().optional(),
        localShippingDiscount: joi.number().optional(),
        onlineCreditCardRates: joi.number().optional(),
        CODRates: joi.number().optional(),
        walletRates: joi.number().optional(),
        eliteBannerCount: joi.number().optional(),
        discountVoucherCount: joi.number().optional(),
        redirectionPerClickCharges: joi.number().optional(),
        currency: joi.string().optional(),
        preDefinedTemplate: joi.number().optional(),
        stockKeepingUnits: joi.number().optional(),
        users: joi.number().optional(),
        vendorStores: joi.number().optional(),
        vouchers: joi.number(),
        storage: joi.number().optional(),
        cardUsage: joi.number(),
        customizationTemplate: joi.boolean(),
        loyaltyProgram: joi.boolean(),
        unlimitedUsers: joi.boolean(),
        unlimitedSKU: joi.boolean(),
        autoApproval: joi.boolean(),
        cardVoucher: joi.boolean(),
        discountVoucher: joi.boolean(),
        eliteBannerAllowed: joi.boolean(),
        discountOffer: joi.string().length(24),
        media: UniversalFunctions.mediaAuth,
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE).description("Type of media"),
        validity: joi.number(),
        durationType: joi.string().valid([APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR, APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH, APP_CONSTANTS.PROMO_DURATION_TYPE.DAY]),
        type: joi.string().valid([APP_CONSTANTS.PLAN_TYPE.NORMAL, APP_CONSTANTS.PLAN_TYPE.PLUS_CARD, APP_CONSTANTS.PLAN_TYPE.ELITE_AD, APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER]).default(APP_CONSTANTS.PLAN_TYPE.NORMAL)
    },
    
    ADD_REDIRECTION_BUNDLE: {
        _id: joi.string().length(24),
        name: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        description: joi.object().description("{en:'More than 100 employees',ar:'More than 100 employees'}"),
        price: joi.number().optional(),
        clicks: joi.number().optional(),
        freeClicks: joi.number().optional(),
        media: UniversalFunctions.mediaAuth,
        mediaType: joi.string().valid([APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE, APP_CONSTANTS.MEDIA_TYPE_ENUM.VIDEO]).default(APP_CONSTANTS.MEDIA_TYPE_ENUM.IMAGE).description("Type of media"),
        validity: joi.number().default(1),
        durationType: joi.string().valid([APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR, APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH, APP_CONSTANTS.PROMO_DURATION_TYPE.DAY]).default(APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR),
        type: joi.string().valid([APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE]).default(APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE)
    },
    LIST_CATEGORIES: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        type: joi.string().valid([APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES]).required().default(APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        search: joi.string().optional().allow(""),
        startDate: joi.number(),
        endDate: joi.number()
    },
    LIST_CURRENCY: {skip: joi.number().optional(),
        limit: joi.number().optional(),
        search: joi.string().optional().allow(""),
    },
    LIST_SUB_CATEGORIES: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        parentId: joi.string().length(24),
        search: joi.string().optional().allow(""),
        startDate: joi.number(),
        endDate: joi.number()
    },

    LIST_CONTACT_US: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        type: joi.string().valid([APP_CONSTANTS.REPORT_TYPE.ISSUE, APP_CONSTANTS.REPORT_TYPE.CONTACT_US])
    },
    LIST_SUBSCRIPTIONS: {
        plan: joi.string().length(24),
        discountOffer: joi.string().length(24),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        status: joi.string().valid([APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.INACTIVE])
    },
    LIST_COMMON_SERVICE: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        type: joi.string().valid([
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COURIER_SERVICE,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COVERAGE_AREA,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COLORS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.INTERESTS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.SIZES,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_ADMIN_AD,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_PAID_AD,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.TEAMS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.NEWS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CONTACT_US_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.SKILLS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.LOCATIONS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.PROCESSING_TIME,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.WHATS_NEW,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.UPDATES,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER_AREA,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COUNTRY]).required().default(APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_SIZE),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        parentId: joi.string().length(24)
    },
    LIST_PLANS: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        type: joi.string().valid([APP_CONSTANTS.PLAN_TYPE.NORMAL, APP_CONSTANTS.PLAN_TYPE.PLUS_CARD, APP_CONSTANTS.PLAN_TYPE.ELITE_AD, APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER, APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE]),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    
    LIST_DOWNGRADE_PLAN: {
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    LIST_TEMPLATES: {
        vendorId: joi.string(),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    SEND_EMAIL: {
        selectedId: joi.array().items(joi.string().length(24)),
        subject: joi.string(),
        content: joi.string()
    },
    BLOCK_UNBLOCK: {
        _id: joi.string().length(24).required(),
        action: joi.boolean().valid([true, false])
    },
    DELETE: {
        _id: joi.string().length(24).required(),
    },
    APPROVE_SUB: {
        subscriptionId: joi.string().length(24).required(),
        action: joi.boolean().valid([true, false])
    },
    UPDATE_SUB: {
        subscriptionId: joi.string().length(24).required(),
        textColor: joi.string(),
        textNameSize: joi.string(),
        textDescriptionSize: joi.string()
    },
    ADD_TEMPLATE_CATEGORY: {
        _id: joi.string().length(24),
        name: joi.string(),
        type: joi.string(),
        themeType: joi.string(),
        noOfImages: joi.number(),
        defaultImage: UniversalFunctions.mediaAuth,
    },
    TEST_PUSH: {
        deviceType: joi.string().required().valid([
            APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS,
            APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID,
        ]),
        data: joi.object().required(),
        deviceToken: joi.string().required(),
        type: joi.string().required().valid([
            APP_CONSTANTS.USER_TYPE.USER,
            APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            APP_CONSTANTS.USER_TYPE.ADMIN,
        ]),
    }, 
    LIST_DISCOUNT: {
        status: joi.string().valid([APP_CONSTANTS.DISCOUNT_STATUS.ACTIVE, APP_CONSTANTS.DISCOUNT_STATUS.EXPIRED, APP_CONSTANTS.DISCOUNT_STATUS.ALL]),
        search: joi.string(),
        skip: joi.number(),
        startDate: joi.number(),
        endDate: joi.number(),
        limit: joi.number()
    },
};
