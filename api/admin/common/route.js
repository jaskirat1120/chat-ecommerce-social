// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminCommonRoute');
const UniversalFunctions = require('../../../utils/universal-functions');
const Validator = require('./validator');
const AdminCategoryController = require('./controller');

let NonAuthRoutes = [];

let AuthRoutes = [
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/category`,
        config: {
            description: 'Add Normal Category.',
            notes: 'In name field send as name: {"en": "value", "ar": "value"} for multi language purpose',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addCategory(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addCategory', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_CATEGORY,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/addOrEditCurrency`,
        config: {
            description: 'Add Normal Category.',
            notes: 'In name field send as name: {"en": "value", "ar": "value"} for multi language purpose',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addOrEditCurrency(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addOrEditCurrency', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_CURRENCY,
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
        method: 'PUT',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/category/blockUnblock`,
        config: {
            description: 'Block unblock common.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.blockUnblockCategory(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.blockUnblockCategory', err, request.payload);
                }
            },
            validate: {
                payload: Validator.BLOCK_UNBLOCK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/blockUnblockSubscription`,
        config: {
            description: 'Block unblock common.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.blockUnblockSubscription(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.blockUnblockSubscription', err, request.payload);
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/approveSubscription`,
        config: {
            description: 'Block unblock common.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.approveSubscription(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.approveSubscription', err, request.payload);
                }
            },
            validate: {
                payload: Validator.APPROVE_SUB,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/updateSubscription`,
        config: {
            description: 'Update sub common.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.updateSubscription(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.updateSubscription', err, request.payload);
                }
            },
            validate: {
                payload: Validator.UPDATE_SUB,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/commonService/blockUnblock`,
        config: {
            description: 'Block unblock common services.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.blockCommonService(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addCategory', err, request.query);
                }
            },
            validate: {
                payload: Validator.BLOCK_UNBLOCK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/commonService/delete`,
        config: {
            description: 'delete common services.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.deleteCommonServices(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.deleteCommonServices', err, request.payload);
                }
            },
            validate: {
                payload: Validator.DELETE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/category/delete`,
        config: {
            description: 'deleteCategory common services.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.deleteCategory(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.deleteCategory', err, request.payload);
                }
            },
            validate: {
                payload: Validator.DELETE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/plans/delete`,
        config: {
            description: 'deleteCategory common services.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.deletePlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.deletePlan', err, request.payload);
                }
            },
            validate: {
                payload: Validator.DELETE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/commonService`,
        config: {
            description: 'Add Normal Category.',
            notes: 'In name field send as name: {"en": "value", "ar": "value"} for multi language purpose',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addCommonService(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addCommonService', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_COMMON_SERVICE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/plans`,
        config: {
            description: 'Add Plans for vendor subscription',
            notes: 'In name field send as name: {"en": "value", "ar": "value"} for multi language purpose',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addPlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addPlan', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_PLANS,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/plans/redirection`,
        config: {
            description: 'Add Plans for vendor subscription',
            notes: 'In name field send as name: {"en": "value", "ar": "value"} for multi language purpose',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addPlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addPlan', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_REDIRECTION_BUNDLE,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/plans/blockUnblock`,
        config: {
            description: 'Block unblock common services.',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.blockUnblockPlan(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.blockUnblockPlan', err, request.query);
                }
            },
            validate: {
                payload: Validator.BLOCK_UNBLOCK,
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
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/category`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listCategories(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listCategories', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_CATEGORIES,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listCurrency`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.currencyListing(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.currencyListing', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_CURRENCY,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listDiscount`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listDiscount(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listDiscount', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_DISCOUNT,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/subCategory`,
        config: {
            description: 'sub Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listSubCategories(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listSubCategories', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_SUB_CATEGORIES,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listContactUsIssue`,
        config: {
            description: 'Contact Issue Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listContactUsIssue(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listContactUsIssue', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_CONTACT_US,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/commonService`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listCommonServices(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listCommonServices', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_COMMON_SERVICE,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listSubscriptions`,
        config: {
            description: 'Category Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listSubscriptions(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listSubscriptions', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_SUBSCRIPTIONS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/plans`,
        config: {
            description: 'Plan Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listPlans(request.query, request.auth.credentials);
                    if(request.query.isCSV){
                        return h.response(responseData)
                            .header('Content-Type', 'application/octet-stream')
                            .header('Content-Disposition', 'attachment; filename=reports.csv;');
                    }
                    else{
                        return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
                    }
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listPlans', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_PLANS,
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
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/listDowngradeRequests`,
        config: {
            description: 'Plan Listing.',
            auth: {
                strategies: [APP_CONSTANTS.AUTH_STRATEGIES.ADMIN]
                , mode: 'optional'
            },
            tags: ['api', 'admin/common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listDowngradeRequests(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listDowngradeRequests', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_DOWNGRADE_PLAN,
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
        path: `/${APP_CONSTANTS.API.ROUTES.COMMON}/${APP_CONSTANTS.API.VERSIONS.v1}/templateCategory`,
        config: {
            description: 'Add template Category for vendor',
            auth: false,
            tags: ['api', 'common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.addTemplateCategory(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addTemplateCategory', err, request.query);
                }
            },
            validate: {
                payload: Validator.ADD_TEMPLATE_CATEGORY,
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
    {
        method: 'POST',
        path: `/${APP_CONSTANTS.API.ROUTES.COMMON}/${APP_CONSTANTS.API.VERSIONS.v1}/testPush`,
        config: {
            description: 'test Push ',
            auth: false,
            tags: ['api', 'common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.testPush(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.addTemplateCategory', err, request.query);
                }
            },
            validate: {
                payload: Validator.TEST_PUSH,
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
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.COMMON}/${APP_CONSTANTS.API.VERSIONS.v1}/templateCategory`,
        config: {
            description: 'Get template Category for vendor',
            auth: false,
            tags: ['api', 'common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listTemplateCategories(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listTemplateCategories', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_TEMPLATES,
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
    {
        method: 'GET',
        path: `/${APP_CONSTANTS.API.ROUTES.COMMON}/${APP_CONSTANTS.API.VERSIONS.v1}/newsLetterSubscriber`,
        config: {
            description: 'Get template Category for vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.listNewsLetterSubscriber(request.query, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.listNewsLetterSubscriber', err, request.query);
                }
            },
            validate: {
                query: Validator.LIST_TEMPLATES,
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
        path: `/${APP_CONSTANTS.API.ROUTES.COMMON}/${APP_CONSTANTS.API.VERSIONS.v1}/sendEmail`,
        config: {
            description: 'Get template Category for vendor',
            auth: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
            tags: ['api', 'common'],
            handler: async (request, h) => {
                try {
                    let responseData = await AdminCategoryController.sendEmail(request.payload, request.auth.credentials);
                    return SuccessResponse('en', RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, responseData);
                } catch (err) {
                    return ErrorResponse('en', 'AdminCategoryController.sendEmail', err, request.query);
                }
            },
            validate: {
                payload: Validator.SEND_EMAIL,
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
