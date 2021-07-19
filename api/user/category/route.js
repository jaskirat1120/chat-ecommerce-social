// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('UserCategoryRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const UserCategoryController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/category`,
        config: {
            description: 'Category Listing.',
            auth: false,
            tags: ['api', 'user/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserCategoryController.listCategories(request.query, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserCategoryController.listCategories', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_CATEGORIES,
                // headers: UniversalFunctions.authorizationHeaderObjOptional,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/commonServices`,
        config: {
            description: 'Category Listing.',
            auth: false,
            tags: ['api', 'user/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserCategoryController.listCommonServices(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserCategoryController.listCommonServices', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_COMMON_SERVICE,
                // headers: UniversalFunctions.authorizationHeaderObjOptional,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/plans`,
        config: {
            description: 'Plan Listing.',
            auth: false,
            tags: ['api', 'user/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserCategoryController.listPlans(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserCategoryController.listPlans', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_PLAN,
                // headers: UniversalFunctions.authorizationHeaderObjOptional,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/unSubscribeNewsLetter`,
        config: {
            description: 'Plan Listing.',
            auth: false,
            tags: ['api', 'user/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserCategoryController.unSubscribeNewsLetter(request.query, request.auth.credentials);
                    // return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                    return responseData;
                } catch (err) {
                    return ErrorResponse('en', 'UserCategoryController.unSubscribeNewsLetter', err, request.query);
                }
            },
            validate: {
                query: Validator.UNSUBSCRIBE_EMAIL,
                // headers: UniversalFunctions.authorizationHeaderObjOptional,
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
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
