// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('UserAuthRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const AuthValidator = require('./validator');
const CommonValidator = require('../../helper-functions/commonValidator');
const UserAuthController = require('./controller');


let AuthRoutes = [

    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditProfile`,
        config: {
            description: 'add or edit Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.addOrEditProfile(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.addOrEditProfile', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.EDIT_PROFILE,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/close`,
        config: {
            description: 'add or edit Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.closeAccount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.closeAccount', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CLOSE_ACCOUNT,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/settings`,
        config: {
            description: 'app Defaults',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER]
                , mode: 'optional'
            },
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.settings(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.setings', err, {});
                }
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/logout`,
        config: {
            description: 'logout',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.logout(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.logout', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/password`,
        config: {
            description: 'logout',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.changePassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.changePassword', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: AuthValidator.CHANGE_PASSWORD,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },

    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/getProfile`,
        config: {
            description: 'get Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await UserAuthController.getProfile(request.auth.credentials);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.getProfile', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/notifications`,
        config: {
            description: 'Notification Listing',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await UserAuthController.notificationListing(request.query, request.auth.credentials);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.notificationListing', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.NOTIFICATION_LISTING,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },

    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/uploadFile`,
        config: {
            description: 'upload File',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER], mode: 'optional'},
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.uploadFile(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.getProfile', err, request.payload);
                }
            },
            payload: {
                output: 'stream',
                allow: 'multipart/form-data',
                parse: true,
                maxBytes: "52428800",
                timeout: false
            },
            validate: {
                payload: CommonValidator.UPLOAD_FILE,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/deviceToken`,
        config: {
            description: 'update device token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.deviceTokenUpdate(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.deviceTokenUpdate', err, request.payload);
                }
            },
            validate: {
                payload: CommonValidator.DEVICE_TOKEN,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/userVendorDetails`,
        config: {
            description: 'get User Details token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.userVendorDetails(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.userVendorDetails', err, request.query);
                }
            },
            validate: {
                query: CommonValidator.USER_DETAILS,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/tokenLogin`,
        config: {
            description: 'get User Details token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {

                    let responseData = await UserAuthController.tokenLogin(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.tokenLogin', err, {});
                }
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    }

];

let NonAuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/signUp`,
        config: {
            description: 'user signup api',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.signUp(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.userSignup', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.languageHeaderObj,
                payload: AuthValidator.SIGNUP,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/social`,
        config: {
            description: 'user social signup login api',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.socialSignUpOrLogIn(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.socialSignUpOrLogIn', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.languageHeaderObj,
                payload: AuthValidator.SOCIAL_SIGNUP_LOGIN,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/logIn`,
        config: {
            description: 'user Login',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    if(request.payload.data){
                        request.paylaod = await UniversalFunctions.encryptDecryptJs(request.payload.data, 'decrypt', "aes-256-cbc");
                        request.payload = JSON.parse(request.paylaod);
                    }

                    request.payload.language = request.headers.language;

                    let responseData = await UserAuthController.logIn(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.logIn', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.languageHeaderObj,
                payload: AuthValidator.LOGIN_2,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/resendOTP`,
        config: {
            description: 'resend OTP',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.resendOTP(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.resendOTP', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.languageHeaderObj,
                payload: AuthValidator.RESEND_OTP,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyOTP`,
        config: {
            description: 'verify Account',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.verifyAccount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.verifyAccount', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.VERIFY_ACCOUNT,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/forgot`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.forgotPassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.forgotPassword', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.FORGOT_PASSWORD,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/reset`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.resetPassword(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.resetPassword', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.RESET_PASSWORD,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/newsLetter/join`,
        config: {
            description: 'Join News Letter',
            auth: false,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await UserAuthController.joinNewsLetter(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.joinNewsLetter', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.NEWS_LETTER,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/appDefaults`,
        config: {
            description: 'Join News Letter',
            auth: false,
            notes: "Use with caution value of all keys should be same 0 or 1",
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.getAppDefaults(request.query);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.getAppDefaults', err, {});
                }
            },
            validate: {
                query: AuthValidator.APP_DEFAULTS,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/press`,
        config: {
            description: 'Join News Letter',
            auth: false,
            notes: "Use with caution value of all keys should be same 0 or 1",
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserAuthController.getPress(request.query);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.getPress', err, {});
                }
            },
            validate: {
                query: AuthValidator.PRESS,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    }
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
