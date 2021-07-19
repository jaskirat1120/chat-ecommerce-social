'use strict';
// npm modules
const mongoose = require('mongoose');

// constructor
const Schema = mongoose.Schema;
let APP_CONSTANTS = require('../config/constants/app-defaults');

// constamts imported
const LOGGER_TYPES = require('../config').constants.appDefaults.DB_LOGGER_TYPES;

const Log = new Schema({
    sourceFile: {type: String, trim: true, index: true, required: true},
    sourceMethod: {type: String, trim: true, index: true, sparse: true},
    status: {type: Number, default: 500, index: true},
    message: {type: String, trim: true},	// only for error logger
    data: {type: String, trim: true}, // only for request logger
    logLevel: {type: String, required: true, index: true, default: 'error'},
    logType: {
        type: String, enum: [
            LOGGER_TYPES.ERROR.CLIENT,
            LOGGER_TYPES.ERROR.SERVER,
            LOGGER_TYPES.ERROR.THIRD_PARTY,
            LOGGER_TYPES.LOGGER.CRON,
            LOGGER_TYPES.LOGGER.BACKEND_PROCESS
        ]
    },
    createdDate: {type: Number, default: Date.now(), required: true}
}, {
    capped: {size: 1000000, max: 2000, autoIndexId: true},
    timestamps: {
        createdDate: 'createdDate',
        updatedDate: 'updatedDate'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.LOGS, Log);
