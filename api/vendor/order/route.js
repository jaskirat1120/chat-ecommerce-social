// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('VendorOrderRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const VendorOrderController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/order/listOrders`,
        config: {
            description: 'view order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.listOrders(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.listOrders', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_ORDERS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/downloadInvoice`,
        config: {
            description: 'List gift card',
            auth: false,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.downloadInvoice(request.query, request.auth.credentials);
                    return h.response(responseData.buffer)
                        .header('Content-Type', 'application/pdf')
                        .header('Content-Disposition', `attachment; filename=${responseData.name}.pdf;`);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.downloadInvoice', err, request.query);
                }
            },
            validate: {
                query: Validator.DOWNLOAD_INVOICE,
                // headers: UniversalFunctions.authorizationHeaderObjOptional,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/order/changeStatus`,
        config: {
            description: 'view order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.changeOrderStatus(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.changeOrderStatus', err, request.payload);
                }
            },
            validate: {
                payload: Validator.CHANGE_ORDER_STATUS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditDiscount`,
        config: {
            description: 'Add or edit discount',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.addOrEditDiscount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.addOrEditDiscount', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_OR_EDIT_DISCOUNT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/blockUnblockDiscount`,
        config: {
            description: 'Block unblock discount',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.blockUnblockDiscount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.blockUnblockDiscount', err, request.payload);
                }
            },
            validate: {
                payload: Validator.BLOCK_UNBLOCK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/deleteDiscount`,
        config: {
            description: 'delete Discount',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.deleteDiscount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.deleteDiscount', err, request.payload);
                }
            },
            validate: {
                payload: Validator.DELETE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/order/cancel`,
        config: {
            description: 'Cancel Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.cancelOrder(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.cancelOrder', err, request.payload);
                }
            },
            validate: {
                payload: Validator.CANCEL_ORDER,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/approveRefundRequest`,
        config: {
            description: 'delete Discount',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.approveRefundRequest(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.approveRefundRequest', err, request.payload);
                }
            },
            validate: {
                payload: Validator.APPROVE_REFUND,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/checkRefundRequest`,
        config: {
            description: 'view order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.checkRefundRequest(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.listOrders', err, request.query);
                }
            },
            validate: {
                query: Validator.CHECK_REFUND,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/listDiscount`,
        config: {
            description: 'view order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.listDiscount(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.listDiscount', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_DISCOUNT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/listFollowers`,
        config: {
            description: 'list Followers',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.listFollowers(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.listFollowers', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_FOLLOWERS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.VENDORS}/${APP_CONSTANTS.API.VERSIONS.v1}/shareDiscount`,
        config: {
            description: 'list Followers',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'vendor/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await VendorOrderController.shareDiscount(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'VendorOrderController.shareDiscount', err, request.query);
                }
            },
            validate: {
                payload: Validator.SHARE_DISCOUNT,
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


module.exports = [...NonAuthRoutes, ...AuthRoutes]
