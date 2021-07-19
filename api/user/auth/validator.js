// npm modules
const joi = require('joi');
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');
module.exports = {
    LOGIN: {
        countryCode: joi.string().optional().trim().description('with +'),
        phoneNumber: joi.string().optional().trim(),
        password: joi.string().required().trim(),
        email: joi.string().email().trim().lowercase(),
        deviceToken: joi.string().allow(''),
        deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB])
    },
    LOGIN_2: {
        countryCode: joi.string().optional().trim().description('with +'),
        phoneNumber: joi.string().optional().trim(),
        password: joi.string().trim(),
        email: joi.string().email().trim().lowercase(),
        deviceToken: joi.string().allow(''),
        deviceType: joi.string().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB]),
        data: joi.string()
    },
    VERIFY_ACCOUNT: {
        OTP: joi.string().required(),
        countryCode: joi.string().required().trim().description('with +'),
        phoneNumber: joi.string().required().trim(),
    },
    RESEND_OTP: {
        countryCode: joi.string().required().trim().description('with +'),
        phoneNumber: joi.string().required().trim(),
    },
    FORGOT_PASSWORD: {
        email: joi.string().email().required().trim(),
    },
    NEWS_LETTER: {
        email: joi.string().email().required().trim(),
    },
    RESET_PASSWORD: {
        id: joi.string().required(),
        resetPasswordExpiry: joi.number().required(),
        password: joi.string().required()
    },
    CHANGE_PASSWORD: {
        oldPassword: joi.string().required(),
        newPassword: joi.string().required()
    },
    NOTIFICATION_LISTING: {
        skip: joi.number(),
        limit: joi.number(),
        type: joi.string().valid([
            APP_CONSTANTS.NOTIFICATION_LISTING_TYPE.ORDER,
            APP_CONSTANTS.NOTIFICATION_LISTING_TYPE.SOCIAL,
        ])
    },
    CLOSE_ACCOUNT:{
        status: joi.string().valid(APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.CLOSED).required()
    },
    APP_DEFAULTS: {
        vendorId: joi.string().allow(""),
        defaultCollectionText: joi.number(),
        defaultCollectionImage: joi.number(),
        loginBackgroundImage: joi.number(),
        loginBackgroundImageVendor: joi.number(),
        termsAndCondition:  joi.number(),
        privacyPolicy:  joi.number(),
        socialMediaFeedPolicy:  joi.number(),
        websiteDesclaimer:  joi.number(),
        cookiesPolicy:  joi.number(),
        userPolicy: joi.number(),
        vendorPolicy: joi.number(),
        intellectualPolicy: joi.number(),
        contactAdmin: joi.number(),
        address:joi.number(),
        emailAdmin: joi.number(),
        instagramUrl :joi.number(),
        facebookUrl :joi.number(),
        twitterUrl :joi.number(),
        pInterestUrl :joi.number(),
        joinNewsLetterImage :joi.number(),
        joinNewsLetter :joi.number(),
        linkedInUrl :joi.number(),
        androidAppUrl :joi.number(),
        iosAppUrl :joi.number(),
        defaultCollectionFontSize: joi.number(),
        defaultCollectionFontColor: joi.number(),
        defaultCollectionFontLocation: joi.number()
    },
    PRESS:{
        vendorId: joi.string().allow(""),
        press :joi.number(),
        ourStory :joi.number(),
        ourStoryMedia :joi.number(),
        ourPlanMedia :joi.number(),
        pressMedia :joi.number(),
        FAQs :joi.number(),
        FAQMedia :joi.number(),
        newsUpdateTitle :joi.number(),
        ourTeamTitle :joi.number(),
        contactUsTitle :joi.number(),
        careerTitle :joi.number(),
        contactUsMedia :joi.number(),
        whatsNewMedia :joi.number(),
        newsMedia :joi.number(),
        careerMedia :joi.number(),
        teamMedia :joi.number(),
        email :joi.number(),
        address :joi.number(),
        phoneNumber :joi.number(),

    },
    SIGNUP: {
        countryCode: joi.string().required().trim().description('with +'),
        firstName: joi.string().required().trim(),
        lastName: joi.string().required().trim(),
        phoneNumber: joi.string().required().trim(),
        interests: joi.array().items(joi.string().length(24)),
        email: joi.string().email().required().trim().lowercase(),
        password: joi.string().required().trim(),
        ISO: joi.string().when('signUpBy', {
            is: APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.PHONE_NUMBER,
            then: joi.string().required().trim(), otherwise: joi.optional().allow('')
        }).description('send in case of phone Number signup'),
        signUpBy: joi.string().required().valid([
            APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.NORMAL
        ]).default(APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.NORMAL),
        deviceToken: joi.string(),
        language: joi.string().description("en", "ar"),
        deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB])
    },
    SOCIAL_SIGNUP_LOGIN: {
        countryCode: joi.string().optional().trim().description('with +'),
        firstName: joi.string().optional().trim(),
        lastName: joi.string().optional().trim(),
        phoneNumber: joi.string().optional().trim(),
        interests: joi.array().items(joi.string().length(24)),
        email: joi.string().email().optional().trim().lowercase(),
        ISO: joi.string().description('send in case of phone Number signup'),
        profilePic: UniversalFunctions.mediaAuth,
        signUpBy: joi.string().required().valid([
            APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.INSTAGRAM,
            APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.FACEBOOK,
            APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.APPLE,
            APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE,
        ]).default(APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE),
        socialId: joi.string().required(),
        deviceToken: joi.string(),
        language: joi.string().description("en", "ar"),
        deviceType: joi.string().required().valid([APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID, APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB])
    },
    EDIT_PROFILE: {
        interests: joi.array().items(joi.string().length(24)),
        firstName: joi.string().optional().trim(),
        lastName: joi.string().optional().trim(),
        gender: joi.string().optional().trim(),
        city: joi.string().optional().trim(),
        currency: joi.string().optional().trim(),
        dob: joi.number().optional(),
        phoneNumber: joi.object().keys({
            phoneNo: joi.string().optional().trim(),
            countryCode: joi.string().optional().trim().description('with +'),
            ISO: joi.string().description('send in case of phone Number signup'),
        }),
        email: joi.string().email().optional().trim().lowercase(),
        bio: joi.string().allow(""),
        language: joi.string().description("en", "ar"),
        profilePic: UniversalFunctions.mediaAuth,
    }
};
