
// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;

// local modules
const SuccessResponse = require('../../../lib/response-manager').sendSuccess;
const ErrorResponse = require('../../../lib/response-manager').wrapError('AdminUserRoute');
const UniversalFunctions	=	require('../../../utils/universal-functions');
const UserValidator	=	require('./validator');
const AdminUserController	=	require('./controller');

let NonAuthRoutes = [

];

let AuthRoutes = [
	{
		method: 'GET',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/user`,
		config: {
			description: 'get User.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/user'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminUserController.listUsers(request.query,request.auth.credentials);
					if(request.query.isCSV){
						return h.response(responseData)
							.header('Content-Type', 'application/octet-stream')
							.header('Content-Disposition', 'attachment; filename=reports.csv;');
					}
					else{
						return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
					}
				}catch(err){
					return ErrorResponse('en','AdminUserController.listUsers',err,request.query);
				}
			},
			validate: {
				query: UserValidator.GET_USER,
				headers: UniversalFunctions.authorizationHeaderObj,
				failAction: UniversalFunctions.failActionFunction
			},
			plugins: {
				'hapi-swagger': {
					//payloadType: 'form'
				}
			}
		}
	},
    {
		method: 'PUT',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/user/blockUnblock`,
		config: {
			description: 'block Unblock User.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/user'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminUserController.blockUnBlockUser(request.payload,request.auth.credentials);
					console.log(responseData)
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminUserController.blockUnBlockUser',err,request.payload);
				}
			},
			validate: {
				payload: UserValidator.BLOCK_USER,
				headers: UniversalFunctions.authorizationHeaderObj,
				failAction: UniversalFunctions.failActionFunction
			},
			plugins: {
				'hapi-swagger': {
					//payloadType: 'form'
				}
			}
		}
	},
    {
		method: 'PUT',
		path: `/${APP_CONSTANTS.API.ROUTES.ADMIN}/${APP_CONSTANTS.API.VERSIONS.v1}/user/delete`,
		config: {
			description: 'delete User.',
			auth :APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
			tags: ['api','admin/user'],
			handler: async (request, h) => {
				try{
					let responseData = await AdminUserController.deleteUsers(request.payload,request.auth.credentials);
					return SuccessResponse('en',RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,responseData);
				}catch(err){
					return ErrorResponse('en','AdminUserController.deleteUsers',err,request.payload);
				}
			},
			validate: {
				payload: UserValidator.DELETE_USER,
				headers: UniversalFunctions.authorizationHeaderObj,
				failAction: UniversalFunctions.failActionFunction
			},
			plugins: {
				'hapi-swagger': {
					//payloadType: 'form'
				}
			}
		}
	}
];


module.exports = [...NonAuthRoutes,...AuthRoutes];
