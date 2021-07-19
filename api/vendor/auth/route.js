// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('VendorAuthRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const AuthValidator = require('./validator');
const CommonValidator = require('../../helper-functions/commonValidator');
const VendorAuthController = require('./controller');


let AuthRoutes = [

    {
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditProfile`,
        config: {
            description: 'add or edit Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.addOrEditProfile(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.addOrEditProfile', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/updateStatus`,
        config: {
            description: 'add or edit Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.updateStatus(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.updateStatus', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.UPDATE_STATUS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/settings`,
        config: {
            description: 'app Defaults',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR]
                , mode: 'optional'
            },
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.settings(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.setings', err, {});
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/logout`,
        config: {
            description: 'logout',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.logout(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.logout', err, request.payload);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/password`,
        config: {
            description: 'Change Password',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.changePassword(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.changePassword', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/selectTemplate`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.selectTemplate(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.selectTemplate', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.SELECT_TEMPLATE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/builder/step1`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.selectTemplate(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.selectTemplate', err, request.payload);
                }
            },
            payload: {
                maxBytes: "52428800",
                timeout: false
            },
            validate: {
                payload: AuthValidator.SELECT_TEMPLATE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/builder/step2`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.secondStep(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.secondStep', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.STEP_2,
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/builder/step3`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.thirdStep(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.thirdStep', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.STEP_3,
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/builder/step4`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.fourthStep(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.fourthStep', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.STEP_4,
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/builder/step5`,
        config: {
            description: 'Select template',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.fifthStep(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.fifthStep', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.STEP_5,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/getProfile`,
        config: {
            description: 'get Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await VendorAuthController.getProfile(request.auth.credentials, request.query);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.getProfile', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.GET_PROFILE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/notificationListing`,
        config: {
            description: 'get Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.notificationListing(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.notificationListing', err, request.query);
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/soldProducts`,
        config: {
            description: 'soldProducts Profile',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await VendorAuthController.soldProducts(request.auth.credentials);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.getProfile', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/listSubVendor`,
        config: {
            description: 'list sub vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await VendorAuthController.listSubVendor(request.query, request.auth.credentials);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.getProfile', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.LIST_SUB_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/listManagingAccount`,
        config: {
            description: 'list sub vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    if (request.auth.credentials) {
                        let responseData = await VendorAuthController.listManagingAccounts(request.query, request.auth.credentials);
                        return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    } else return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, {});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.listManagingAccounts', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.LIST_SUB_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/checkVendor`,
        config: {
            description: 'get Profile',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.checkVendor(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.checkVendor', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CHECK_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/bank/addOrEdit`,
        config: {
            description: 'Add or edit bank account',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.addOrEditBank(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.addOrEditBank', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_EDIT_BANK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/bank/delete`,
        config: {
            description: 'Add or edit bank account',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.deleteBank(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deleteBank', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_BANK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditSubVendor`,
        config: {
            description: 'Add or edit sub vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.addOrEditSubVendor(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deleteBank', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_OR_EDIT_SUB_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/deleteSubVendor`,
        config: {
            description: ' delete sub vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.deleteSubVendor(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deleteSubVendor', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_SUB_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/bank/makeDefault`,
        config: {
            description: 'Add or edit bank account',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.setAsDefaultBank(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.setAsDefaultBank', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.MAKE_DEFAULT_BANK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/updateTheme`,
        config: {
            description: 'update Theme',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.updateTheme(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.updateTheme', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.UPDATE_THEME,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/bank/list`,
        config: {
            description: 'Add or edit bank account',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/bank'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.listBanks(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.listBanks', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.LIST_BANKS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/uploadFile`,
        config: {
            description: 'upload File',
            auth: {strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR], mode: 'optional'},
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.uploadFile(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.getProfile', err, request.payload);
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/analytics`,
        config: {
            description: 'Analytics',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.analytics(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.analytics', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.ANALYTICS_DATA,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/earningGraph`,
        config: {
            description: 'earning Graph',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.earningGraph(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.earningGraph', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.SALES_REPORTS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/salesRevenue`,
        config: {
            description: 'Analytics',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.salesRevenue(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.salesRevenue', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.SALES_REPORTS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/dashboard`,
        config: {
            description: 'Analytics',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.dashboard(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.dashboard', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.DASHBOARD,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/earningDashboard`,
        config: {
            description: 'earning Dashboard',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.earningDashboard(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.dashboard', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.DASHBOARD,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/earningListing`,
        config: {
            description: 'earning Listing',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.earningListing(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.earningListing', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.EARNING_LISTING,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/transferRequest`,
        config: {
            description: 'Special transfer request',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.specialTransferRequest(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.specialTransferRequest', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.SPECIAL_TRANSFER_REQUEST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/userVendorDetails`,
        config: {
            description: 'get User Details token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'user'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.userVendorDetails(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserAuthController.userVendorDetails', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.USER_DETAILS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditManagingAccount`,
        config: {
            description: 'Special transfer request',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    // if(request.manager.credentials){
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.createSubManagingAccount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    // }
                    // else return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,{});
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.createSubManagingAccount', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.CREATE_MANAGING_ACCOUNT,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    }
];

let NonAuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/signUp`,
        config: {
            description: 'user signup api',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.signUp(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.userSignup', err, request.payload);
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
                    deprecated: true
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v2}/signUp`,
        config: {
            description: 'user signup api',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.signUp(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.userSignup', err, request.payload);
                }
            },
            validate: {
                headers: UniversalFunctions.languageHeaderObj,
                payload: AuthValidator.SIGN_UP_V2,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/logIn`,
        config: {
            description: 'user Login',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    if(request.payload.data){
                        request.paylaod = await UniversalFunctions.encryptDecryptJs(request.payload.data, 'decrypt', "aes-256-cbc");
                        request.payload = JSON.parse(request.paylaod);
                    }

                    request.payload.language = request.headers.language;

                    let responseData = await VendorAuthController.logIn(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.userLogin', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/resendOTP`,
        config: {
            description: 'resend OTP',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.resendOTP(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.resendOTP', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyOTP`,
        config: {
            description: 'verify Account',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await VendorAuthController.verifyAccount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.verifyAccount', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/forgot`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.forgotPassword(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.forgotPassword', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/reset`,
        config: {
            description: 'forgot password',
            auth: false,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.resetPassword(request.payload);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.resetPassword', err, request.payload);
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
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/deviceToken`,
        config: {
            description: 'update device token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.deviceTokenUpdate(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deviceTokenUpdate', err, request.payload);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/contactUsIssue`,
        config: {
            description: 'update device token',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR],
                mode: "optional"
            },
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.contactUsIssue(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deviceTokenUpdate', err, request.payload);
                }
            },
            validate: {
                payload: CommonValidator.CONTACT_US,
                headers: UniversalFunctions.authorizationHeaderObjOptional,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/autoRenewal`,
        config: {
            description: 'update device token',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorAuthController.updateSubscriptionRenewal(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorAuthController.deviceTokenUpdate', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.AUTO_RENEWAL,
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    }
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
