'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');
const Schema = mongoose.Schema;
// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

// const status
const messageStatus = [
    APP_CONSTANTS.MESSAGE_STATUS_ENUM.SENT,
    APP_CONSTANTS.MESSAGE_STATUS_ENUM.DELIVERED,
    APP_CONSTANTS.MESSAGE_STATUS_ENUM.DELETED,
    APP_CONSTANTS.MESSAGE_STATUS_ENUM.READ,
];

let models = {
    id: {type: Schema.ObjectId, refPath: 'by'},
    by: {type: String, enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]}
};
// constructor

let Chat = new Schema({
    sender: {type: Schema.ObjectId, refPath: 'senderModel', index: true, required: true},
    senderModel: {
        type: String,
        enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]
    },
    receiver: {type: Schema.ObjectId, refPath: 'receiverModel', index: true, required: true},
    receiverModel: {
        type: String,
        enum: [APP_CONSTANTS.DATABASE.MODELS_NAME.USER, APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS]
    },
    conversationId: {type: Schema.ObjectId, trim: true, index: true},
    message: {type: String, trim: true},
    readBy: {type: [models], default: []},
    chatWith: {type: String, enum: [APP_CONSTANTS.FEED_LIST_TYPE.VENDOR, APP_CONSTANTS.FEED_LIST_TYPE.USER], default: APP_CONSTANTS.FEED_LIST_TYPE.USER},
    readBySender: {type: Number},
    readByReceiver: {type: Number},
    messageType: {
        type: String, required: true, enum: [
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.TEXT,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.AUDIO,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.IMAGE,
            APP_CONSTANTS.DATABASE.MESSAGE_TYPE.VIDEO,
        ], default: APP_CONSTANTS.DATABASE.MESSAGE_TYPE.TEXT
    },
    viewType: {
        type: String, required: true, enum: [
            APP_CONSTANTS.DATABASE.VIEW_TYPE.SINGLE,
            APP_CONSTANTS.DATABASE.VIEW_TYPE.TWICE,
            APP_CONSTANTS.DATABASE.VIEW_TYPE.ALWAYS,
        ], default: APP_CONSTANTS.DATABASE.VIEW_TYPE.ALWAYS
    },
    fileUrl: UniversalFunctions.mediaSchema,
    status: {type: String, enum: messageStatus, default: messageStatus[0]},
    chatStatus: {type: String, enum: statusEnum, default: statusEnum[0]},
    deletedDate: {type: Number, default: 0},
    chatCreatedDate: {type: Number, required: true, default: +new Date()},
    createdDate: {type: Number, required: true, default: +new Date()},
    updatedDate: {type: Number, required: true, default: +new Date()},
    deletedFor: {type: [models], default: []},
    muteBy: {type: [models], default: []},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CHATS, Chat);
