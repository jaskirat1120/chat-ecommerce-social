// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const EMAIL_STRINGS = require('../../../config').constants.appContants;

// local modules
const CategoryHelpers = require('../../helper-functions/categories');
const EmailHandler = require('../../email-helpers/emailHandler');
const UniversalFunctions = require('../../../utils/universal-functions');

let listCategories = async (payload, userData, ipInfo) => {
    try {
        let status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)}),
            sort: {rank: 1}
        };
        payload.remoteAddress = ipInfo.remoteAddress
        return await CategoryHelpers.categoryListing(payload, payload.type, status, options)
    } catch (e) {
        throw e
    }
};

let listCommonServices = async (payload, userData) => {
    try {
        payload.status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        return await CategoryHelpers.listCommonServices(payload, userData, Models.commonServices)
    } catch (e) {
        throw e
    }
};


let listPlans = async (payload, userData) => {
    try {
        payload.status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        payload.type = APP_CONSTANTS.PLAN_TYPE.NORMAL;
        return await CategoryHelpers.listCommonServices(payload, userData, Models.plans)
    } catch (e) {
        throw e
    }
};

let unSubscribeNewsLetter = async (payload)=>{
    try{
        payload.email = await UniversalFunctions.encryptDecrypt(payload.email, 'decrypt')
        let unsubscribe = await Dao.updateMany(Models.newsLetters, {
            email: payload.email
        }, {
            status: APP_CONSTANTS.STATUS_ENUM.INACTIVE
        }, {
            multi: true
        })

        payload.signUpString1 = EMAIL_STRINGS.EMAIL_CONTENT.UNSUBSCRIBE_EMAIL_TEXT.en;
        payload.thankYouString2 = EMAIL_STRINGS.EMAIL_CONTENT.THANK_YOU_2.en;
        return EmailHandler.unSubscribeEmail(payload)
    }catch (e){
        throw e
    }
}
module.exports = {
    listCategories: listCategories,
    listCommonServices: listCommonServices,
    listPlans: listPlans,
    unSubscribeNewsLetter: unSubscribeNewsLetter
};
