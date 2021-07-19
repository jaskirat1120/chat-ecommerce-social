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
const UserFollowController = require('./controller');


let AuthRoutes = [
    {
        method: 'POST',
        path: `/user/${APP_CONSTANTS.API.VERSIONS.v1}/follow/followUnFollow`,
        config: {
            description: 'follow or unfollow user or vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/follow'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFollowController.followUnFollow(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFollowController.followUnFollow', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.FOLLOW_UNFOLLOW,
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
        path: `/user/${APP_CONSTANTS.API.VERSIONS.v1}/follow/following`,
        config: {
            description: 'add and update user categories',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/follow'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFollowController.listFollowings(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFollowController.listFollowings', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_FOLLOWING,
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
        path: `/user/${APP_CONSTANTS.API.VERSIONS.v1}/follow/follower`,
        config: {
            description: 'add and update user categories',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/follow'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFollowController.listFollowers(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFollowController.listFollowers', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_FOLLOWERS,
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
        path: `/user/${APP_CONSTANTS.API.VERSIONS.v1}/follow/followersAndFollowings`,
        config: {
            description: 'add and update user categories',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/follow'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFollowController.listFollowersAndFollowings(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFollowController.listFollowers', err, request.query);
                }
            },
            validate: {
                query: AuthValidator.LIST_FOLLOWERS,
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
        path: `/user/${APP_CONSTANTS.API.VERSIONS.v1}/follow/acceptReject`,
        config: {
            description: 'accept Reject Follow Request',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/follow'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserFollowController.acceptRejectFollowRequest(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserFollowController.acceptRejectFollowRequest', err, request.payload);
                }
            },
            validate: {
                payload: AuthValidator.ACCEPT_REJECT_REQUEST,
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

];

let NonAuthRoutes = [];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
