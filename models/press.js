'use strict';
// npm modules
const mongoose = require('mongoose');

// Constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');
const UniversalFunctions = require('../utils/universal-functions');

// const status
const statusEnum = [
    APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    APP_CONSTANTS.STATUS_ENUM.BLOCKED,
    APP_CONSTANTS.STATUS_ENUM.DELETED,
    APP_CONSTANTS.STATUS_ENUM.INACTIVE
];

// constructor
const Schema = mongoose.Schema;
const image = UniversalFunctions.mediaSchema;
let policyArray = {
    header: {},
    description: {}
}
const AppDefaults = new Schema({
    FAQs: [policyArray],
    ourStory: {},
    press: {},
    newsUpdateTitle: {},
    ourTeamTitle: {},
    contactUsTitle: {},
    careerTitle: {},
    pressMedia: image,
    ourStoryMedia: image,
    ourPlanMedia: image,
    FAQMedia: image,
    contactUsMedia: image,
    whatsNewMedia: image,
    newsMedia: image,
    careerMedia: image,
    teamMedia: image,
    email: {type: String},
    address: {},
    phoneNumber: {type: [String], default: []},
    status: {type: String, required: true, enum: statusEnum, default: statusEnum[0]},
    createdDate: {type: Number, default: +new Date(), required: true, index: true},
    updatedDate: {type: Number, default: +new Date(), required: true, index: true}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});

module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.PRESS, AppDefaults);
