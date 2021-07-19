
// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminVendorRoute');
const UniversalFunctions	=	require('../../../utils/universal-functions');
const Validator	=	require('./validator');
const AdminOrderController	=	require('./controller');

let NonAuthRoutes = [

];

let AuthRoutes = [
	{
		method: 'GET',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/order`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.listOrders(request.query,request.auth.credentials);
					if(request.query.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminStoreController.vendorListing',err,request.query);
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/downloadInvoice`,
		config: {
			description: 'List gift card',
			auth: false,
			tags: ['api', 'admin/order'],
			handler: async (request, h) => {
				try {
					let responseData = await AdminOrderController.downloadInvoice(request.query, request.auth.credentials);
					return h.response(responseData.buffer)
						.header('Content-Type', 'application/pdf')
						.header('Content-Disposition', `attachment; filename=${responseData.name}.pdf;`);
				} catch (err) {
					return ErrorResponse('en', 'AdminOrderController.downloadInvoice', err, request.query);
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
		method: 'GET',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/transaction`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.listTransactions(request.query,request.auth.credentials);
					if(request.query.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminStoreController.vendorListing',err,request.query);
				}
			},
			validate: {
				query: Validator.EARNING_LISTING,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/transaction`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.listTransactions(request.payload,request.auth.credentials);
					if(request.payload.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminStoreController.vendorListing',err,request.query);
				}
			},
			validate: {
				payload: Validator.EARNING_LISTING,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/transferRequests`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.listTransferRequests(request.query,request.auth.credentials);
					if(request.query.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminStoreController.listTransferRequests',err,request.query);
				}
			},
			validate: {
				query: Validator.TRANSFER_LISTING,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/transferRequestComplete`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.transferComplete(request.query,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.transferComplete',err,request.query);
				}
			},
			validate: {
				query: Validator.TRANSFER_DONE,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/transferTransaction`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.transferTransaction(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.transferTransaction',err,request.payload);
				}
			},
			validate: {
				payload: Validator.TRANSACTION_TRANSFER,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/checkRefundRequest`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/order'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminOrderController.checkRefundRequest(request.query,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.checkRefundRequest',err,request.payload);
				}
			},
			validate: {
				query: Validator.CHECK_REFUND_REQUEST,
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


module.exports = [...NonAuthRoutes,...AuthRoutes];
