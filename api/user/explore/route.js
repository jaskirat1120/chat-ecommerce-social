// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('UserExploreRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const UserExploreController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/home`,
        config: {
            description: 'Home Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.homeApi(request.query,request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listCategories', err, request.query);
                }
            },
            validate: {
                query: Validator.HOME_API,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    console.log("request.headers",request.info)
                    let responseData = await UserExploreController.listVendors(request.query, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listVendors', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_VENDOR,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/reviews`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.reviewListVendor(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.reviewListVendor', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_REVIEWS,
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    console.log("request.headers",request.info)
                    let responseData = await UserExploreController.listVendors(request.payload, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listVendors', err, request.payload);
                }
            },
            validate: {
                payload: Validator.LIST_VENDOR,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/currencyConversion`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.currencyConversion(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.currencyConversion', err, request.query);
                }
            },
            validate: {
                query: Validator.CURRENCY_CONVERSION,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/listCurrency`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.currencyListing(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.currencyListing', err, request.payload);
                }
            },
            validate: {
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/redirectionCharges`,
        config: {
            description: 'redirection Charges Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    console.log("request.headers",request.info)
                    let responseData = await UserExploreController.redirectionCharges(request.payload, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.redirectionCharges', err, request.payload);
                }
            },
            validate: {
                payload: Validator.REDIRECTION_CHARGES,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendorsForTagging`,
        config: {
            description: 'List Vendor for tagging Api.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    console.log("request.headers",request.info)
                    let responseData = await UserExploreController.listVendorsForTagging(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listVendors', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_VENDOR_TAGGING,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/mayLike`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listVendorMayLike(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listVendorMayLike', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_VENDOR_MAY_LIKE,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/trendingVendors`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.trendingVendors(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.trendingVendors', err, request.query);
                }
            },
            validate: {
                query: Validator.TRENDING_VENDORS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/offerVendors`,
        config: {
            description: 'List Offers of Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listOfferVendors(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listOfferVendors', err, request.query);
                }
            },
            validate: {
                query: Validator.TRENDING_VENDORS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/listOffers`,
        config: {
            description: 'List Offers Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listOffers(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listOffers', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_OFFERS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/popularCollections`,
        config: {
            description: 'List Offers Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listPopularCollections(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listPopularCollections', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_OFFERS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/trendingHashAndPost`,
        config: {
            description: 'Trending Hash Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.trendingHashAndPost({}, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listPopularCollections', err, {});
                }
            },
            validate: {
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/editorPicks`,
        config: {
            description: 'Trending Hash Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.editorPicks({}, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.editorPicks', err, {});
                }
            },
            validate: {
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/recommendedProducts`,
        config: {
            description: 'recommended Products Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.recommendedProducts(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.recommendedProducts', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_OFFERS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/{vendor}`,
        config: {
            description: 'List Vendor Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listVendors(request.params, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listVendors', err, request.query);
                }
            },
            validate: {
                params: Validator.VENDOR_DETAIL,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product`,
        config: {
            description: 'List Products Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listProducts(request.query, request.auth.credentials,"" ,request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listProducts', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_PRODUCT,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/product/{productId}`,
        config: {
            description: 'List Products Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listProducts(request.params, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listProducts', err, request.query);
                }
            },
            validate: {
                params: Validator.PRODUCT_DETAIL,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/subVendor`,
        config: {
            description: 'List sub vendors Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.listSubVendor(request.query, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.listSubVendor', err, request.query);
                }
            },
            validate: {
                query: Validator.SUB_VENDOR,
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/home/search`,
        config: {
            description: 'List sub vendors Api.',
            auth: {
                strategies:[APP_CONSTANTS.AUTH_STRATEGIES.USER],
                mode: 'optional'
            },
            tags: ['api', 'user/explore'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserExploreController.homeSearch(request.payload, request.auth.credentials, request.info);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserExploreController.homeSearch', err, request.payload);
                }
            },
            validate: {
                payload: Validator.HOME_SEARCH,
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
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
