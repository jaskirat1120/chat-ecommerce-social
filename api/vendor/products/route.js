// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('VendorProductRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const AuthValidator = require('./validator');
const CommonValidator = require('../../helper-functions/commonValidator');
const StoreProductController = require('./controller');
const { AssistantFallbackActionsPage, AssistantFallbackActionsContext } = require('twilio/lib/rest/preview/understand/assistant/assistantFallbackActions');


let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/product`,
        config: {
            description: 'add or edit Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    request.payload.language = request.headers.language;
                    let responseData = await StoreProductController.addOrEditProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.addOrEditProduct', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/product`,
        config: {
            description: 'list Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    request.query.language = request.headers.language;
                    let responseData = await StoreProductController.listProduct(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.listProduct', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.LIST_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/product/delete`,
        config: {
            description: 'list Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    request.query.language = request.headers.language;
                    let responseData = await StoreProductController.deleteProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.deleteProduct', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/updateProduct`,
        config: {
            description: 'add or edit Product',
            auth: false,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await StoreProductController.updatePorductSizesCommon(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.updatePorductSizesCommon', err, request.payload);
                }
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                headers: UniversalFunctions.languageHeaderObj,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/updateComments`,
        config: {
            description: 'add or edit Product',
            auth: false,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await StoreProductController.updateCreatedAt(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.updatePorductSizesCommon', err, request.payload);
                }
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                headers: UniversalFunctions.languageHeaderObj,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/getShippingCost`,
        config: {
            description: 'add or edit Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await StoreProductController.getShippingCost(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'StoreProductController.getShippingCost', err, request.payload);
                }
            },
            validate: {
                query: AuthValidator.GET_SHIPPING_COST,
                headers: UniversalFunctions.languageHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form'
                }
            }
        }
    },
];

let NonAuthRoutes = [];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
