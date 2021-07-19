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
const UserReactionController = require('./controller');


let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product/likeUnlike`,
        config: {
            description: 'Like or Unlike Products',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserReactionController.likeUnlikeProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserReactionController.likeUnlikeFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.LIKE_UNLIKE_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/likeUnlike`,
        config: {
            description: 'Like or Unlike Products',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/vendor'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserReactionController.likeUnlikeVendor(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserReactionController.likeUnlikeVendor', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.LIKE_UNLIKE_VENDOR,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product/favouriteUnFavourite`,
        config: {
            description: 'Add or remove from favourite',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserReactionController.favouriteUnFavouriteProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserReactionController.favouriteUnFavouriteFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.FAVOURITE_UNFAVOURITE_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product/share`,
        config: {
            description: 'Share Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserReactionController.shareProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserReactionController.shareFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.SHARE_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product/favourite`,
        config: {
            description: 'List Favourite Product',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/product'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserReactionController.listFavouriteProducts(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserReactionController.listLikes', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_FAVOURITE_PRODUCT,
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
