// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('UserOrderRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const CommonValidator = require('../../helper-functions/commonValidator');
const UserOrderController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/addToCart`,
        config: {
            description: 'Add To cart Products',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addToCart(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addToCart', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_TO_CART,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/updateCart`,
        config: {
            description: 'update quantity in cart',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.updateCart(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.updateCart', err, request.payload);
                }
            },
            validate: {
                payload: Validator.UPDATE_CART,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/viewCart`,
        config: {
            description: 'View Cart',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.viewCart(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.viewCart', err, request.query);
                }
            },
            validate: {
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/removeProduct`,
        config: {
            description: 'View Cart',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.removeProduct(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.removeProduct', err, request.payload);
                }
            },
            validate: {
                payload: Validator.REMOVE_PRODUCT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/placeOrder`,
        config: {
            description: 'Place order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.placeOrder(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.placeOrder', err, request.payload);
                }
            },
            validate: {
                payload: Validator.PLACE_ORDER,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/listOrders`,
        config: {
            description: 'view order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.listOrders(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.placeOrder', err, request.payload);
                }
            },
            validate: {
                query: Validator.LIST_ORDERS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/addOrEditAddress`,
        config: {
            description: 'Add Or Edit Address',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addOrEditAddress(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addOrEditAddress', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_EDIT_ADDRESS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/listAddress`,
        config: {
            description: 'List Address',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.listAddress(request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.listAddress', err, request.payload);
                }
            },
            validate: {
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/address/delete`,
        config: {
            description: 'List Address',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.deleteAddress(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.deleteAddress', err, request.payload);
                }
            },
            validate: {
                payload: Validator.DELETE_ADDRESS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/address/makeDefault`,
        config: {
            description: 'List Address',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.makeDefault(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.makeDefault', err, request.payload);
                }
            },
            validate: {
                payload: Validator.MAKE_DEFAULT_ADDRESS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/wishList/addOrEditProduct`,
        config: {
            description: 'Add Or Edit Product to wishlist',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/wishList'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addOrEditProductWishList(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addOrEditProductWishList', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_TO_WISHLIST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/transaction/wallet`,
        config: {
            description: 'Transaction listing wallet',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.transactionListing(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.transactionListing', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_WALLET_TRANSACTION,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/wishList/removeProduct`,
        config: {
            description: 'Remove Product from wishlist',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/wishList'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.removeProductWishList(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.removeProductWishList', err, request.payload);
                }
            },
            validate: {
                payload: Validator.REMOVE_WISHLIST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/wishList/listProduct`,
        config: {
            description: 'Remove Product from wishlist',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/wishList'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.listWishList(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.listWishList', err, request.payload);
                }
            },
            validate: {
                query: Validator.LIST_WISHLIST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/cancel`,
        config: {
            description: 'Cancel order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.cancelOrder(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.cancelOrder', err, request.payload);
                }
            },
            validate: {
                payload: Validator.CANCEL,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/requestRefund`,
        config: {
            description: 'request Refund order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.requestRefund(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.requestRefund', err, request.payload);
                }
            },
            validate: {
                payload: Validator.REQUEST_REFUND,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/review`,
        config: {
            description: 'Review Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addReview(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.cancelOrder', err, request.payload);
                }
            },
            validate: {
                payload: CommonValidator.CREATE_RATING,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/return`,
        config: {
            description: 'Review Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.initiateReturn(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.initiateReturn', err, request.payload);
                }
            },
            validate: {
                payload: Validator.INITIATE_RETURN,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/order/applyPromo`,
        config: {
            description: 'Apply Promo Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.applyPromo(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.applyPromo', err, request.payload);
                }
            },
            validate: {
                payload: Validator.APPLY_PROMO,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyPayment`,
        config: {
            description: 'Verify Payment Order',
            auth: false,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.verifyPayment(request.payload, request.auth.credentials);
                    return h.redirect(responseData);
                } catch (err) {
                    return h.redirect(`${process.env.websiteUrl}payment-error`);
                }
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyPaymentRetryOrder`,
        config: {
            description: 'Verify Payment Order',
            auth: false,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.verifyPaymentRetryOrder(request.payload, request.auth.credentials);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyPaymentWallet`,
        config: {
            description: 'Verify Payment Order',
            auth: false,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.verifyPaymentWallet(request.payload, request.auth.credentials);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/verifyPaymentGiftCard`,
        config: {
            description: 'Verify Payment Order',
            auth: false,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.verifyPaymentGiftCard(request.payload, request.auth.credentials);
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
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/retryPayment`,
        config: {
            description: 'Verify Payment Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.retryPayment(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.retryPayment', err, request.payload);
                }
            },
            validate: {
                payload: Validator.RETRY_PAYMENT,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/addMoneyToWallet`,
        config: {
            description: 'Verify Payment Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addMoneyToWallet(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addMoneyToWallet', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_MONEY_TO_WALLET,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/addGiftCard`,
        config: {
            description: 'Verify Payment Order',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.addGiftCard(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addGiftCard', err, request.payload);
                }
            },
            validate: {
                payload: Validator.ADD_MONEY_TO_WALLET,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/redeemVoucher`,
        config: {
            description: 'Redeem Voucher',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.redeemVoucher(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.addGiftCard', err, request.payload);
                }
            },
            validate: {
                payload: Validator.REDEEM_VOUCHER,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/listGiftCard`,
        config: {
            description: 'List gift card',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.listGiftCards(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.listGiftCards', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_WISHLIST,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/checkRefundRequest`,
        config: {
            description: 'List gift card',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.checkRefundRequest(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.checkRefundRequest', err, request.query);
                }
            },
            validate: {
                query: Validator.CHECK_REQUEST_REFUND,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/checkShippingCharge`,
        config: {
            description: 'List gift card',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.checkShippingCharges(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.checkShippingCharges', err, request.payload);
                }
            },
            validate: {
                payload: Validator.CHECK_SHIPPING,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/shareGiftCard`,
        config: {
            description: 'List gift card',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.shareGiftCard(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.shareGiftCard', err, request.payload);
                }
            },
            validate: {
                payload: Validator.SHARE_GIFT_CARD,
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
        path: `/${APP_CONSTANTS.API.ROUTES.USER}/${APP_CONSTANTS.API.VERSIONS.v1}/downloadInvoice`,
        config: {
            description: 'List gift card',
            auth: false,
            tags: ['api', 'user/order'],
            handler: async (request, h) => {
                try {
                    let responseData = await UserOrderController.downloadInvoice(request.query, request.auth.credentials);
                    return h.response(responseData.buffer)
                        .header('Content-Type', 'application/pdf')
                        .header('Content-Disposition', `attachment; filename=${responseData.name}.pdf;`);
                } catch (err) {
                    return ErrorResponse('en', 'UserOrderController.downloadInvoice', err, request.query);
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
];


module.exports = [...NonAuthRoutes, ...AuthRoutes]
