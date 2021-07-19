// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('VendorChatRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const AuthValidator = require('./validator');
const VendorChatController = require('./controller');


let AuthRoutes = [

    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/messages`,
        config: {
            description: 'message Listing',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/chat'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorChatController.messageListingAggregate(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorChatController.messageListingAggregate', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.GET_MESSAGE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/messagesApp`,
        config: {
            description: 'message Listing',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/chat'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorChatController.messageListingAggregateApp(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorChatController.messageListingAggregateApp', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.GET_MESSAGE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/chats`,
        config: {
            description: 'Chat  Listing',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/chat'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorChatController.chatListing(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorChatController.chatListing', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.CHAT_LISTING,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/chat/delete`,
        config: {
            description: 'Delete Chat',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/chat'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorChatController.deleteChat(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorChatController.deleteChat', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_CHAT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/chat/mute`,
        config: {
            description: 'Mute Chat',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            tags: ['api', 'vendor/chat'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorChatController.muteChat(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorChatController.muteChat', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.MUTE_CHAT,
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

let NonAuthRoutes = [];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
