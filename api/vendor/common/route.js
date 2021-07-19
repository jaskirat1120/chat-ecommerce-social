// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('VendorCommonRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const VendorCategoryController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/category`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR]
                , mode: 'optional'
            },
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.listCategories(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.listCategories', err, request.query);
                }
            },
            validate: {
                payload: Validator.LIST_CATEGORIES,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/collections`,
        config: {
            description: 'Collection Listing.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.listCollections(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.listCollections', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_COLLECTIONS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/commonService`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR]
                , mode: 'optional'
            },
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.listCommonServices(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.listCommonServices', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_COMMON_SERVICE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/plans`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR]
                , mode: 'optional'
            },
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.listPlans(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.listCommonServices', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_PLANS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/addCategory`,
        config: {
            description: 'Add new common.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.VENDOR]
                , mode: 'optional'
            },
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.addCategory(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.addCategory', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_CATEGORY,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/downgradePlan`,
        config: {
            description: 'Select Plan for subscription',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.downgradeRequest(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.downgradeRequest', err, request.query);
                }
            },
            validate: {
                payload: Validator.DOWNGRADE_REQUEST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/selectPlan`,
        config: {
            description: 'Select Plan for subscription',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.selectPlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.selectPlan', err, request.query);
                }
            },
            validate: {
                payload: Validator.SELECT_PLAN,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/makePaymentPlan`,
        config: {
            description: 'make Payment Plan for subscription',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.makePaymentPlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.makePaymentPlan', err, request.payload);
                }
            },
            validate: {
                payload: Validator.MAKE_PAYMENT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyPaymentPlan`,
        config: {
            description: 'Verify Payment Order',
            auth: false,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.verifyPaymentPlan(request.payload);
                    return h.redirect(responseData);
                } catch (err) {
                    return h.redirect(`${process.env.websiteUrl}payment-error`);
                }
            },
            validate: {
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/getBase64`,
        config: {
            description: 'Get base 64 for image',
            auth: false,
            tags: ['api', 'vendor/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorCategoryController.getBase64(request.query);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorCategoryController.getBase64', err, request.query);
                }
            },
            validate: {
                query: Validator.GET_BUFFER,
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
