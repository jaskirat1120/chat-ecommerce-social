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
const UserFeedController = require('./controller');


let AuthRoutes = [
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed`,
        config: {
            description: 'List Feeds',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.listFeed(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.listFeed', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed`,
        config: {
            description: 'List Feeds',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.listFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.listFeed', err, request.query);
                }
            },
            validate: {
                payload: AuthValidator.LIST_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feedDetail`,
        config: {
            description: 'List Feeds',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.feedDetail(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.feedDetail', err, request.query);
                }
            },
            validate: {
                payload: AuthValidator.LIST_FEED_DETAILS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditFeed`,
        config: {
            description: 'Add or edit Feed',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.addOrEditFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.addOrEditFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/delete`,
        config: {
            description: 'Delete Feed',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.deleteFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.deleteFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/report`,
        config: {
            description: 'Report Feed',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.reportFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.reportFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.REPORT_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/hide`,
        config: {
            description: 'Hide Feed',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.hideFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.hideFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.HIDE_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/addOrEditComment`,
        config: {
            description: 'Add Media Comment',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.addOrEditComment(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.addOrEditComment', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ADD_COMMENT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/deleteComment`,
        config: {
            description: 'Delete particular comment',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.deleteCommentFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.deleteCommentFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.DELETE_COMMENT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/likeUnlike`,
        config: {
            description: 'Like or Unlike Media',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.likeUnlikeFeed(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.likeUnlikeFeed', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.LIKE_UNLIKE_FEED,
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
    // {
    //     method: 'POST',
    //     path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/favouriteUnFavourite`,
    //     config: {
    //         description: 'Add or remove from favourite',
    //         auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
    //         tags: ['api', 'user/feed'],
    //         handler: async (request, h) => {
    //             try {
    //                 let responseData = await UserFeedController.favouriteUnFavouriteFeed(request.payload, request.auth.credentials);
    //                 return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
    //             } catch (err) {
    //                 return ErrorResponse('en', 'UserFeedController.favouriteUnFavouriteFeed', err, request.payload);
    //             }
    //         },
    //         validate: {
    //             payload: AuthValidator.FAVOURITE_UNFAVOURITE_FEED,
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form'
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/shareMedia`,
    //     config: {
    //         description: 'Share Media',
    //         auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
    //         tags: ['api', 'user/feed'],
    //         handler: async (request, h) => {
    //             try {
    //                 let responseData = await UserFeedController.shareFeed(request.payload, request.auth.credentials);
    //                 return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
    //             } catch (err) {
    //                 return ErrorResponse('en', 'UserFeedController.shareFeed', err, request.payload);
    //             }
    //         },
    //         validate: {
    //             payload: AuthValidator.SHARE_MEDIA,
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form'
    //             }
    //         }
    //     }
    // },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/likes`,
        config: {
            description: 'Share Media',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.listLikes(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.listLikes', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_LIKES,
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
    // {
    //     method: 'GET',
    //     path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/favourite`,
    //     config: {
    //         description: 'Share Media',
    //         auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
    //         tags: ['api', 'user/feed'],
    //         handler: async (request, h) => {
    //             try {
    //                 let responseData = await UserFeedController.listFavourites(request.query, request.auth.credentials);
    //                 return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
    //             } catch (err) {
    //                 return ErrorResponse('en', 'UserFeedController.listLikes', err, request.query);
    //             }
    //         },
    //         validate: {
    //             query: AuthValidator.LIST_LIKES,
    //             headers: UniversalFunctions.authorizationHeaderObj,
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form'
    //             }
    //         }
    //     }
    // },
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/comment`,
        config: {
            description: 'List Comments',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFeedController.listComments(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFeedController.listComments', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_COMMENTS,
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
];

let NonAuthRoutes = [];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
