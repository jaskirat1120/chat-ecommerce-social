let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let APP_CONSTANTS = require('../config/constants/app-defaults');

let userTypeEnum = [
    APP_CONSTANTS.USER_TYPE.USER,
    APP_CONSTANTS.USER_TYPE.STORE_REPRESENTATIVE,
    APP_CONSTANTS.USER_TYPE.DRIVER,
];

let appVersions = new Schema({
    latestIOSVersion: {type: String, required: true},
    latestAndroidVersion: {type: String, required: true},
    criticalAndroidVersion: {type: String, required: true},
    criticalIOSVersion: {type: String, required: true},
    appType: {type: String, default: APP_CONSTANTS.USER_TYPE.USER, enum: userTypeEnum},
    createdDate: {type: Number, default: +new Date()},
    updatedDate: {type: Number, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.APP_VERSIONS, appVersions);
