'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE,
];
// constructor
const Schema = mongoose.Schema;


const newsLetters = new Schema({
    email : {type: String, trim: true, required: true},
    status: {type: String, index: true, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.ACTIVE},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updateAt: 'updatedAt'
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.NEWS_LETTERS, newsLetters);
