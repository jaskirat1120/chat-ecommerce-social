const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var APP_CONSTANTS = require('../config/constants/app-defaults');

const Currencies = new Schema({
    USD: {},
    from: {type: String},
    to: {type: String},
    conversion: {type: Number},
    reverseConversion: {type: Number},
    updatedDate: {type: Number, default: +new Date()},
    createdDate: {type: Number, default: +new Date()},
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.CURRENCIES, Currencies);
