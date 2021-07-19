// npm modules
const joi	=	require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');

module.exports = {
    GET_USER : {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        id : joi.string(),
		search:joi.string(),
        skip:joi.number(),
        limit:joi.number(),
        startDate: joi.number(),
        endDate: joi.number(),
    },
    BLOCK_USER : {
        id : joi.string().required().length(24),
        action:joi.boolean().description('True to block ,False to unblock').required(),
    },
    DELETE_USER : {
        id : joi.string().required().length(24)
    }
}
