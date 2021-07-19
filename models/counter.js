const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var APP_CONSTANTS = require('../config/constants/app-defaults');

const Counter = new Schema({
    count: {type: Number, required: true, default: 0},
    vendor: {type: Schema.ObjectId},
    type: {
        type: String, required: true, enum: [
            APP_CONSTANTS.COUNTER_TYPE.ORDER,
            APP_CONSTANTS.COUNTER_TYPE.SUB_ORDER,
            APP_CONSTANTS.COUNTER_TYPE.PRODUCT,
            APP_CONSTANTS.COUNTER_TYPE.INVOICE,
            APP_CONSTANTS.COUNTER_TYPE.TRANSACTION,
        ], default: APP_CONSTANTS.COUNTER_TYPE.ORDER
    }

});


module.exports = mongoose.model(APP_CONSTANTS.DATABASE.MODELS_NAME.ORDER_COUNTER, Counter);
