// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');

module.exports = {
    GET_FEED: {
        isCSV: joi.boolean().valid([true, false]).allow(""),
        _id: joi.string(),
        user: joi.string(),
        vendor: joi.string(),
        search: joi.string().allow(""),
        skip: joi.number(),
        limit: joi.number(),
        reportedPost: joi.boolean().valid([true, false]),
        comments: joi.number(),
        startDate: joi.number(),
        endDate: joi.number(),
        likes: joi.number()
    },
    BLOCK_FEED: {
        id: joi.string().required().length(24),
        action: joi.boolean().description('True to block ,False to unblock').required(),
    },
    LIST_COMMENTS: {
        feed: joi.string().required().length(24),
        skip: joi.number(),
        limit: joi.number()
    },
    LIST_REPORTS: {
        feed: joi.string().length(24),
        skip: joi.number(),
        limit: joi.number()
    },
    DELETE_USER: {
        id: joi.string().required().length(24)
    },
    DELETE_FEED: {
        _id: joi.string().required().length(24)
    }
}
