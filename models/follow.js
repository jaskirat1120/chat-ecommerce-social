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
    APP_CONSTANTS.STATUS_ENUM.FOLLOW,
    APP_CONSTANTS.STATUS_ENUM.UNFOLLOW,
    APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST,
    APP_CONSTANTS.STATUS_ENUM.SENT,
    APP_CONSTANTS.STATUS_ENUM.ACCEPTED,
    APP_CONSTANTS.STATUS_ENUM.REJECTED,
];
const followType = [
    APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR,
    APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER,
];
// constructor
const Schema = mongoose.Schema;

let logs = {
    status: {type: String},
    createdDate: {type: Number},
    actionBy: {type: Schema.Types.ObjectId, refPath: 'logs.actionModel', index: true, sparse: true},
    actionModel: {
        type: String,
        enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]
    }
};

const follow = new Schema({
    sender: {type: Schema.Types.ObjectId, refPath: 'senderModel', index: true, sparse: true},
    receiver: {type: Schema.Types.ObjectId, refPath: 'receiverModel', index: true, sparse: true},

    senderModel: {
        type: String,
        enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]
    },
    receiverModel: {
        type: String,
        enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]
    },

    followType: {type: String, enum: followType, default: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER, required: true},
    status: {type: String, index: true, enum: statusEnum, default: APP_CONSTANTS.STATUS_ENUM.FOLLOW},
    logs: [logs],
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updateAt: 'updatedAt'
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.FOLLOWS, follow);
