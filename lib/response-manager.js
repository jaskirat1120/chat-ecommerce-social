// constructor
const Boom = require('boom');

// constants imported
const CONSTANTS = require('../config/constants');
const RESPONSE_MESSAGES = CONSTANTS.responseMessages;

// local modules
const LogManager = require('./log-manager');

const sendError = function (language, data) {
    console.log("language,data", language, data)
    if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('message')) {
        console.log('attaching resposnetype', data);
        let msg = data.message[language || 'en'];
        msg = msg.replace(msg.charAt(0), msg.charAt(0).toUpperCase());
        let errorToSend = Boom.create(data.statusCode, msg);
        errorToSend.output.payload.responseType = data.type;
        console.log('after resposnetype', errorToSend);
        return errorToSend;
    } else {
        let errorToSend = '';
        if (typeof data == 'object') {
            if (data.name == 'MongoError') {
                errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.DB_ERROR.message[language || 'en'];
                if (data.code = 11000) {
                    let duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                    duplicateValue = duplicateValue.replace('}', '');
                    errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.DUPLICATE.message[language || 'en'] + " : " + duplicateValue;
                    if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {
                        errorToSend = RESPONSE_MESSAGES.STATUS_MSG.ERROR.DUPLICATE.message[language || 'en'];
                    }
                }
                if (data.code = 16755) {
                    let duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                    duplicateValue = duplicateValue.replace('}', '');
                    errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.DUPLICATE.message[language || 'en'] + " : " + duplicateValue;
                    if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {
                        errorToSend = RESPONSE_MESSAGES.STATUS_MSG.ERROR.DUPLICATE.message[language || 'en'];
                    }
                }
            } else if (data.name == 'ApplicationError') {
                errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + ' : ';
            } else if (data.name == 'ValidationError') {
                errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + data.message;
            } else if (data.name == 'ValidatorError') {
                errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + data.message;
            } else if (data.name == 'CastError') {
                errorToSend += RESPONSE_MESSAGES.STATUS_MSG.ERROR.DB_ERROR.message[language || 'en'] + RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID.message[language || 'en'] + data.value;
            } else if (data.name === "RuntimeError") {
                let msg = data.message.split('/');
                errorToSend += msg[msg.length - 1];
            }
        } else {
            errorToSend = data;

        }
        let customErrorMessage = errorToSend;
        if (typeof customErrorMessage == 'string') {
            if (errorToSend.indexOf("[") > -1) {
                customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
            }
            customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
            customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');

            customErrorMessage = customErrorMessage.replace(customErrorMessage.charAt(0), customErrorMessage.charAt(0).toUpperCase());
        }

        return Boom.create(400, customErrorMessage);
    }
};

const sendSuccess = function (language, successMsg, data) {
    successMsg = successMsg || RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT.message;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('message')) {
        return {
            type: 'success',
            statusCode: successMsg.statusCode,
            message: successMsg.message[language || 'en'],
            data: data || {}
        };

    } else {
        return {
            type: 'success',
            statusCode: 200,
            message: successMsg,
            data: data || {}
        };
    }
};

const wrapError = (sourceFile) => {
    return (language, sourceMethod, error, userPostedData) => {
        console.log(userPostedData)
        try {
            LogManager.logResponeError(sourceFile, sourceMethod, error, userPostedData);
            return sendError(language, error);
        } catch (err) {
            LogManager.logger.error(err);
        }
    };
};

module.exports = {
    sendError: sendError,
    sendSuccess: sendSuccess,
    wrapError: wrapError
};
