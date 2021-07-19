
// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminVendorRoute');
const UniversalFunctions	=	require('../../../utils/universal-functions');
const Validator	=	require('./validator');
const AdminStoreController	=	require('./controller');

let NonAuthRoutes = [

];

let AuthRoutes = [
	{
		method: 'GET',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor`,
		config: {
			description: 'get Vendor listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.vendorListing(request.query,request.auth.credentials);
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
				query: Validator.GET_VENDOR,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/{vendorId}`,
		config: {
			description: 'get Vendor Details.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.vendorListing(request.params,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.vendorListing',err,request.params);
				}
			},
			validate: {
				params: Validator.VENDOR_DETAILS,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/blockUnblock`,
		config: {
			description: 'block Unblock Vendor.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.blockUnblockVendor(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.blockUnblockVendor',err,request.payload);
				}
			},
			validate: {
				payload: Validator.BLOCK_VENDOR,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/delete`,
		config: {
			description: 'delete vendor.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.deleteVendor(request.payload,request.auth.credentials);

					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.deleteVendor',err,request.payload);
				}
			},
			validate: {
				payload: Validator.VERIFY_VENDOR,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/verify`,
		config: {
			description: 'Verify Vendor or reject.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.verifyVendor(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.verifyVendor',err,request.payload);
				}
			},
			validate: {
				payload: Validator.VERIFY_VENDOR,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/product/approve`,
		config: {
			description: 'Approve Product or reject.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/product'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.approveUnApproveProduct(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.approveUnApproveProduct',err,request.payload);
				}
			},
			validate: {
				payload: Validator.APPROVE_PRODUCT,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/product/blockUnblock`,
		config: {
			description: 'block Unblock Product.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/product'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.blockUnblockProduct(request.payload,request.auth.credentials);
					console.log(responseData)
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.blockUnblockProduct',err,request.payload);
				}
			},
			validate: {
				payload: Validator.BLOCK_PRODUCT,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/vendor/update`,
		config: {
			description: 'update Vendor.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/vendor'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.updateVendor(request.payload,request.auth.credentials);
					console.log(responseData)
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.updateVendor',err,request.payload);
				}
			},
			validate: {
				payload: Validator.UPDATE_VENDOR,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/product/delete`,
		config: {
			description: 'block Unblock Product.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/product'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.deleteProduct(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.blockUnblockProduct',err,request.payload);
				}
			},
			validate: {
				payload: Validator.BLOCK_PRODUCT,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/product/update`,
		config: {
			description: 'update Product.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/product'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.updateProduct(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminStoreController.updateProduct',err,request.payload);
				}
			},
			validate: {
				payload: Validator.UPDATE_PRODUCT,
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
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/product`,
		config: {
			description: 'get Product listing.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/product'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminStoreController.listProducts(request.query,request.auth.credentials);
					if(request.query.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminStoreController.listProducts',err,request.query);
				}
			},
			validate: {
				query: Validator.PRODUCT_LISTING,
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


module.exports = [...NonAuthRoutes,...AuthRoutes];
