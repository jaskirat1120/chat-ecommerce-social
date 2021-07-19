// npm modules
const joi = require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    LOGIN: {
        email: joi.string().email().required().lowercase().trim(),
        password: joi.string().required().trim(),
        deviceToken: joi.string().allow("")
    },
    VERIFY_ACCOUNT: {
        OTP: joi.string().required(),
        email: joi.string().email().required()
    },
    LOGIN_2: {
        data: joi.string().required()
    },
    CHANGE_SETTINGS: {
        termsAndCondition: joi.object(),
        privacyPolicy: joi.object(),
        socialMediaFeedPolicy: joi.object(),
        websiteDesclaimer: joi.object(),
        cookiesPolicy: joi.object(),
        userPolicy:joi.array().items(
            joi.object().keys({
                header: joi.object(),
                description: joi.object()
            })
        ),
        vendorPolicy: joi.array().items(
            joi.object().keys({
                header: joi.object(),
                description: joi.object()
            })
        ),
        intellectualPolicy: joi.array().items(
            joi.object().keys({
                header: joi.object(),
                description: joi.object()
            })
        ),
        FAQs: joi.array().items(
            joi.object().keys({
                header: joi.object(),
                description: joi.object()
            })
        ),
        ourStory: joi.object(),
        press: joi.object(),
        joinNewsLetter: joi.object(),
        contactAdmin: joi.string(),
        address: joi.string(),
        emailAdmin: joi.string(),
        instagramUrl: joi.string(),
        facebookUrl: joi.string(),
        twitterUrl: joi.string(),
        pInterestUrl: joi.string(),
        androidAppUrl:  joi.string(),
        iosAppUrl:  joi.string(),
        linkedInUrl: joi.string(),
        defaultCollectionText: joi.string(),
        pressMedia: UniversalFunctions.mediaAuth,
        ourStoryMedia: UniversalFunctions.mediaAuth,
        ourPlanMedia: UniversalFunctions.mediaAuth,
        FAQMedia: UniversalFunctions.mediaAuth,
        loginBackgroundImage: UniversalFunctions.mediaAuth,
        loginBackgroundImageVendor: UniversalFunctions.mediaAuth,
        defaultCollectionImage: UniversalFunctions.mediaAuth,
        joinNewsLetterImage: UniversalFunctions.mediaAuth,
        defaultCollectionFontSize:joi.string(),
        defaultCollectionFontColor: joi.string(),
        defaultCollectionFontLocation: joi.string()
    },
    
    CHANGE_SETTINGS_PRESS: {
        FAQs: joi.array().items(
            joi.object().keys({
                header: joi.object(),
                description: joi.object()
            })
        ),
        ourStory: joi.object(),
        press: joi.object(),
        newsUpdateTitle: joi.object(),
        careerTitle: joi.object(),
        contactUsTitle: joi.object(),
        ourTeamTitle: joi.object(),
        address: joi.object(),
        email: joi.string(),
        phoneNumber: joi.array().items(joi.string()),
        pressMedia: UniversalFunctions.mediaAuth,
        ourStoryMedia: UniversalFunctions.mediaAuth,
        ourPlanMedia: UniversalFunctions.mediaAuth,
        FAQMedia: UniversalFunctions.mediaAuth,
        teamMedia: UniversalFunctions.mediaAuth,
        careerMedia: UniversalFunctions.mediaAuth,
        newsMedia: UniversalFunctions.mediaAuth,
        whatsNewMedia: UniversalFunctions.mediaAuth,
        contactUsMedia: UniversalFunctions.mediaAuth,
    },
    CHANGE_PASSWORD: {
        oldPassword: joi.string().trim().required(),
        newPassword: joi.string().trim().required()
    },
    ADD_SUB_ADMIN: {
        adminId: joi.string().length(24).allow(""),
        name: joi.string().required(),
        password: joi.string().optional().allow(""),
        email: joi.string().email().required(),
        permissions: joi.string().allow("")
    },
    LIST_SUB_ADMIN: {
        _id: joi.string().allow("").length(24),
        skip: joi.number(),
        limit: joi.number(),
    },
    BLOCK_UNBLOCK_SUB_ADMIN: {
        _id: joi.string().length(24).required(),
        action: joi.boolean().valid([true, false])
    },
    FORGOT_PASSWORD: {
        email: joi.string().email().required(),
    },
    RESET_PASSWORD: {
        id: joi.string().required(),
        password: joi.string().required(),
        resetPasswordExpiry: joi.number().required()
    },
    RESEND_OTP: {
        email: joi.string().required()
    },
    DASHBOARD_DATA: {
        startDate: joi.number(),
        endDate: joi.number()
    },
    NOtIFICATION_LISTING: {
        skip: joi.number(),
        limit: joi.number(),
        vendorName: joi.string().allow(""),
        orderNumber: joi.string().allow(""),
        search: joi.string().allow(""),
        startDate: joi.number(),
        endDate: joi.number()
    },
    ANALYTICS_DATA: {
        startDate: joi.number().required(),
        endDate: joi.number().required(),
        graphType: joi.string().valid([
            APP_CONSTANTS.GRAPH_TYPE.WEEKLY,
            APP_CONSTANTS.GRAPH_TYPE.DAILY,
            APP_CONSTANTS.GRAPH_TYPE.YEARLY,
            APP_CONSTANTS.GRAPH_TYPE.MONTHLY,
        ]),
        // status: joi.string().valid([
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
        //     APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED
        // ])
    }
};
