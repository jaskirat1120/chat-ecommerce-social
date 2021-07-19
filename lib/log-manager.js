// npm modules
require('dotenv').config();
require('winston-daily-rotate-file');
const winston = require('winston');

// constants imported
const LOGGER_OPTIONS = require('../config').loggerConf.WINSTON.OPTIONS;
const LOGGER_TYPES = require('../config').constants.appDefaults.DB_LOGGER_TYPES;

// local modules imported
const Dao = require('../dao').queries;
const Models = require('../models');


// instantiate a new Winston Logger with the settings defined above

let logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.printf(obj => {
            let timestamp = new Date();
            let timestampMiliseconds = Date.now();
            let message = ((typeof obj.message) === 'string' ? obj.message : JSON.stringify(obj.message));

            return `date: ${timestamp} dateMili : ${timestampMiliseconds} ${obj.level.toUpperCase()}: ${message}`;
        })
    ),
    exitOnError: false // handled exceptions will not cause process.exit
});

logger.add(new winston.transports.DailyRotateFile(LOGGER_OPTIONS.APP));
logger.add(new winston.transports.DailyRotateFile(LOGGER_OPTIONS.ERRORS));

if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test') {
    logger.add(new winston.transports.Console(LOGGER_OPTIONS.CONSOLE));
}

// create a stream object with a write function that will be used by morgan
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by all transports (file and console)
        logger.info(message);
    }
};

logger.emitErrs = false; // ignore any logger errors

const storeLogInDb = async (dataToInsert) => {
    try {
        await Dao.saveData(Models.Log, dataToInsert);
    } catch (err) {
        logger.error(err);
    }
};

const logResponeError = async (sourceFile, sourceMethod, errorMsg, postedData) => {
    try {
        let errorToWrite = {
            error: errorMsg,
            details: errorMsg.stack || ''
        };

        if (process.env.LOG_CRIT_ERR_TO_DB === 'True') {
            let dataToInsert = {
                sourceFile: sourceFile,
                sourceMethod: sourceMethod,
                status: errorMsg.statusCode || 500,
                message: JSON.stringify(errorToWrite),
                logLevel: 'error',
                logType: !!errorMsg.statusCode && errorMsg.statusCode >= 400 && errorMsg.statusCode < 500 ? LOGGER_TYPES.ERROR.CLIENT : LOGGER_TYPES.ERROR.SERVER,
                data: JSON.stringify(postedData)
            };

            await storeLogInDb(dataToInsert);
        }
        // logging to file
        logger.error(errorToWrite);
    } catch (err) {
        logger.error(err);
    }
};

module.exports = {
    logger,
    logResponeError
};
