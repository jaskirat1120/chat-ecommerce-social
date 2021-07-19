// npm modules
const joi = require('joi');

// constants imported
const APP_CONSTANTS = require('../../../config/constants/app-defaults');
const UniversalFunctions = require('../../../utils/universal-functions');

module.exports = {
    LIST_CATEGORIES: {
        type: joi.string().valid([APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES]).required().default(APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
        parentId: joi.string().length(24),
        categoryId: joi.string().length(24),
        vendorId: joi.string()
    },
    LIST_COMMON_SERVICE: {
        vendorId: joi.string().allow(""),
        type: joi.string().valid([
            APP_CONSTANTS.COMMON_SERVICES_TYPE.INTERESTS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.TEAMS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.NEWS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CONTACT_US_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.SKILLS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.LOCATIONS,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.UPDATES,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.COUNTRY,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.CAREER_AREA,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.RETURN_REASON,
            APP_CONSTANTS.COMMON_SERVICES_TYPE.WHATS_NEW
        ]).required().default(APP_CONSTANTS.COMMON_SERVICES_TYPE.INTERESTS),
        search: joi.string().allow(""),
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    LIST_PLAN: {
        skip: joi.number().optional(),
        limit: joi.number().optional(),
    },
    UNSUBSCRIBE_EMAIL: {
        email: joi.string().optional(),
    }
};
