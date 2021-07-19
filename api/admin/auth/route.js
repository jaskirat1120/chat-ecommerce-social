// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminAuthRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const AuthValidator = require('./validator');
const CommonValidator = require('../../helper-functions/commonValidator');
const AdminAuthController = require('./controller');

let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/uploadFile`,
        config: {
            description: 'upload File',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    request.payload.language = request.headers.language;
                    let responseData = await AdminAuthController.uploadFile(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.uploadFile', err, request.payload);
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
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/dashboard`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.dashboardData(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.dashboardData', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.DASHBOARD_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/dashboardPCV`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.dashboardPCV(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.dashboardPCB', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.DASHBOARD_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/analytics`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.dailyAnalytics(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.dailyAnalytics', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.ANALYTICS_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feedAnalytics`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.feedAnalytics(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.feedAnalytics', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.ANALYTICS_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/notificationListing`,
        config: {
            description: 'Dashboard data',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.notificationListing(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.notificationListing', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.NOtIFICATION_LISTING,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/orderAnalytics`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.orderAnalytics(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.orderAnalytics', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.ANALYTICS_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/earningDashboardAnalytics`,
        config: {
            description: 'Dashboard data',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN], mode: 'optional'},
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    let responseData = await AdminAuthController.earningDashboardAnalytics(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.earningDashboardAnalytics', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.ANALYTICS_DATA,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/deviceToken`,
        config: {
            description: 'update device token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.deviceTokenUpdate(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.deviceTokenUpdate', err, request.payload);
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
    }
];

let NonAuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/login`,
        config: {
            description: 'Login Admin',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {

                    request.paylaod = await UniversalFunctions.encryptDecryptJs(request.payload.data, 'decrypt');
                    request.payload = JSON.parse(request.paylaod);
                    request.payload.language = request.headers.language;

                    let responseData = await AdminAuthController.adminLogin(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.adminLogin', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.LOGIN_2,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyAccount`,
        config: {
            description: 'Login Admin',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {

                    // request.paylaod = await UniversalFunctions.encryptDecrypt(request.payload.data, 'decrypt');
                    // request.payload = JSON.parse(request.paylaod);
                    // request.payload.language = request.headers.language;

                    let responseData = await AdminAuthController.verifyAccount(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.adminLogin', err, request.payload);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/resendOTP`,
        config: {
            description: 'Login Admin',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {

                    // request.paylaod = await UniversalFunctions.encryptDecrypt(request.payload.data, 'decrypt');
                    // request.payload = JSON.parse(request.paylaod);
                    // request.payload.language = request.headers.language;

                    let responseData = await AdminAuthController.resendOTP(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.resendOTP', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.RESEND_OTP,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/updateAppDefaults`,
        config: {
            description: 'change settings',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.saveSettings(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.saveSettings', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CHANGE_SETTINGS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/updatePress`,
        config: {
            description: 'change settings',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.updatePress(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.updatePress', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CHANGE_SETTINGS_PRESS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/appDefaults`,
        config: {
            description: 'change settings',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.getSettings( request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.getSettings', err, {});
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/subAdmin/blockUnblock`,
        config: {
            description: 'Block unblock subAdmin.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.blockUnblockSubAdmin(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.blockUnblockSubAdmin', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.BLOCK_UNBLOCK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/subAdmin/list`,
        config: {
            description: 'subAdmin list',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.listSubAdmin(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.listSubAdmin', err, {});
                }
            },
            validate: {
                query: AuthValidator.LIST_SUB_ADMIN,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/press`,
        config: {
            description: 'change settings',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.getPress( request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.getPress', err, {});
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/password`,
        config: {
            description: 'change password',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.changePassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.changePassword', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CHANGE_PASSWORD,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditSubAdmin`,
        config: {
            description: 'change password',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.addOrEditSubAdmin(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.addOrEditSubAdmin', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_SUB_ADMIN,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/forgot`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.forgotPassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.forgotPassword', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/reset`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'admin'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminAuthController.resetPassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminAuthController.resetPassword', err, request.payload);
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
    }
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
