// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminUserRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const UserValidator = require('./validator');
const AdminUserController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed`,
        config: {
            description: 'get Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.listFeeds(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.listFeeds', err, request.query);
                }
            },
            validate: {
                query: UserValidator.GET_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/blockUnblock`,
        config: {
            description: 'block Unblock Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.blockUnBlockFeed(request.payload, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.blockUnBlockUser', err, request.payload);
                }
            },
            validate: {
                payload: UserValidator.BLOCK_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/delete`,
        config: {
            description: 'delete Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.deleteFeed(request.payload, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.deleteFeed', err, request.payload);
                }
            },
            validate: {
                payload: UserValidator.DELETE_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/blockUnblockComment`,
        config: {
            description: 'block Unblock Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.blockComment(request.payload, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.blockComment', err, request.payload);
                }
            },
            validate: {
                payload: UserValidator.BLOCK_FEED,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/comments`,
        config: {
            description: 'List Comments Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.listCommentsFeed(request.query, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.listCommentsFeed', err, request.query);
                }
            },
            validate: {
                query: UserValidator.LIST_COMMENTS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/feed/likes`,
        config: {
            description: 'List Likes Feed.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.listLikesFeed(request.query, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.listCommentsFeed', err, request.query);
                }
            },
            validate: {
                query: UserValidator.LIST_COMMENTS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listReports`,
        config: {
            description: 'List Reports.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/feed'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminUserController.listReports(request.query, request.auth.credentials);
                    console.log(responseData)
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminUserController.listReports', err, request.query);
                }
            },
            validate: {
                query: UserValidator.LIST_REPORTS,
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


module.exports = [...NonAuthRoutes, ...AuthRoutes];
