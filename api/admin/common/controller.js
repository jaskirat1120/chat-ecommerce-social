// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Helpers = require('./helper');
const mongoose = require('mongoose');
const CategoryHelpers = require('../../helper-functions/categories');
const EmailHelper = require('../../email-helpers/emailHandler');
const NotificationManager = require('../../../lib/notification-manager');
const UniversalFunctions = require('../../../utils/universal-functions');

let addCategory = async (payload, userData) => {
    try {
        if (payload._id) {
            return await Helpers.updateCategory({_id: payload._id}, payload, userData, Models.categories)
        } else return await Helpers.saveCategory(payload, userData, Models.categories)
    } catch (e) {
        throw e
    }
};


let blockUnblockCategory = async (payload, userData) => {
    try {
        return await Helpers.commonBlockUnblock(payload, userData, Models.categories)
    } catch (e) {
        throw e
    }
};

let addCommonService = async (payload, userData) => {
    try {
        if (payload._id) {
            return await Helpers.updateCommonService({_id: payload._id}, payload, userData, Models.commonServices)
        } else return await Helpers.saveCommonService(payload, userData, Models.commonServices)
    } catch (e) {
        throw e
    }
};


let blockCommonService = async (payload, userData) => {
    try {
        return await Helpers.commonBlockUnblock(payload, userData, Models.commonServices)
    } catch (e) {
        throw e
    }
};

let blockUnblockPlan = async (payload, userData) => {
    try {
        return await Helpers.commonBlockUnblock(payload, userData, Models.plans)
    } catch (e) {
        throw e
    }
};

let addPlan = async (payload, userData) => {
    try {
        if (payload._id) {
            return await Helpers.updateCommonService({_id: payload._id}, payload, userData, Models.plans)
        } else return await Helpers.saveCommonService(payload, userData, Models.plans)
    } catch (e) {
        throw e
    }
};


let listCategories = async (payload, userData) => {
    try {
        let status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        return await CategoryHelpers.categoryListing(payload, payload.type, status, options)
    } catch (e) {
        throw e
    }
};

let listTemplateCategories = async (payload, userData) => {
    try {
        let status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        return await Dao.getData(Models.templateCategories, {status: status}, {}, options)
    } catch (e) {
        throw e
    }
};
let listSubCategories = async (payload, userData) => {
    try {
        let status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        payload.type = APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES;
        payload.categoryType = 'SUB_CATEGORY';
        return await CategoryHelpers.categoryListing(payload, payload.type, status, options)
    } catch (e) {
        throw e
    }
};

let listCommonServices = async (payload, userData) => {
    try {
        payload.status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        return await CategoryHelpers.listCommonServices(payload, userData, Models.commonServices)
    } catch (e) {
        throw e
    }
};
let listPlans = async (payload, userData) => {
    try {
        payload.status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        if (!payload.type) {
            payload.type = {
                $nin: [APP_CONSTANTS.PLAN_TYPE.NORMAL, APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE],
            }
        }
        return await CategoryHelpers.listCommonServices(payload, userData, Models.plans)
    } catch (e) {
        throw e
    }
};

const listNewsLetterSubscriber = async (payload, userData) => {
    try {
        let [data, count] = await Promise.all([
            Dao.getData(Models.newsLetters, {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            }, {}, {
                lean: true,
                ...(payload.skip && {skip: payload.skip}),
                ...(payload.limit && {limit: payload.limit})
            }),
            Dao.countDocuments(Models.newsLetters, {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            })
        ])

        return {data, count}
    } catch (e) {
        throw e
    }
}

let addTemplateCategory = async (payload, userData) => {
    try {
        if (payload._id) {
            return await Helpers.updateCategory({_id: payload._id}, payload, userData, Models.templateCategories)
        } else return await Helpers.saveCategory(payload, userData, Models.templateCategories)
    } catch (e) {
        throw e
    }
};

let testPush = async (payload, userData) => {
    try {
        payload.data = {
            testData: true
        }
        await NotificationManager.sendPush(payload.deviceToken, payload.data, payload.type, payload.deviceType)
    } catch (e) {
        throw e
    }
};


const listSubscriptions = async (payload) => {
    try {
        let criteria = {
            ...(payload.plan && {plan: mongoose.Types.ObjectId(payload.plan)}),
            ...(payload.discountOffer && {discountOffer: mongoose.Types.ObjectId(payload.discountOffer)}),
        };
        let option = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            sort: {
                _id: -1
            },
            lean: true
        };
        if(payload.status && payload.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE){
            criteria.endDate = {$gte: +new Date()}
        }
        if(payload.status && payload.status === APP_CONSTANTS.STATUS_ENUM.INACTIVE){
            criteria.endDate = {$lte: +new Date()}
        }
        let pipeline = [{
            $match: criteria
        }];

        if(payload.skip){
            pipeline.push({$skip: payload.skip})
        }
        if(payload.limit){
            pipeline.push({$limit: payload.limit})
        }

        // pipeline.push({
        //     $lookup: {
        //         localField: 'vendor',
        //         foriegnField: '_id',
        //         from: 'vendors',
        //         as: 'vendorData'
        //     }
        // })

        
        pipeline.push({
            $lookup: {
                let: {vendorId: '$vendor'},
                from: 'commonlogs',
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                {$eq: ["$vendor", "$$vendorId"]},
                                {$ne: ["$status", "DELETED"]},
                                {$eq: ["$type", APP_CONSTANTS.COMMON_LOGS.REDIRECTION]}
                            ]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        visits: {
                            $sum: "$visitor"
                        }
                    }
                }, {
                    $project: {
                        _id: 0
                    }
                }],
                as: 'logs'
            }
        },{
            $unwind: {
                path: '$logs',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $addFields: {
                visitor: "$logs.visits"
            }
        })

        console.log("pipelinepipelinepipelinepipelinepipeline", JSON.stringify(pipeline))
        let [data, count] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.subscriptionLogs, pipeline, [{
                    path: 'vendor',
                    select: 'vendorRegisterName name firstName lastName email hashTag',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                }]),
            // Dao.populateData(Models.subscriptionLogs, criteria, {}, option, [{
            //     path: 'vendor',
            //     select: 'vendorRegisterName name firstName lastName email hashTag',
            //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            // }]),
            Dao.countDocuments(Models.subscriptionLogs, criteria)
        ]);
        return {data, count}
    } catch (e) {
        throw e
    }
};

let blockUnblockSubscription = async (payload, userData) => {
    try {
        return await Helpers.commonBlockUnblock(payload, userData, Models.subscriptionLogs)
    } catch (e) {
        throw e
    }
};


const approveSubscription = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.subscriptionId
        };
        let getSubData = await Dao.findOne(Models.subscriptionLogs, criteria, {}, {lean: true});
        if (getSubData) {
            if (payload.action === true && getSubData.isAdminApproved === true) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.SUB_ALREADY_APPROVED
            } else if (payload.action === false && getSubData.isAdminApproved === false) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.SUB_ALREADY_APPROVED
            } else {
                let dataToUpdate = {
                    isAdminApproved: payload.action,
                    status: payload.action ? APP_CONSTANTS.STATUS_ENUM.ACTIVE : APP_CONSTANTS.STATUS_ENUM.REJECTED
                };
                return await Dao.findAndUpdate(Models.subscriptionLogs, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
            }
        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
    } catch (e) {
        throw e
    }
};

const updateSubscription = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.subscriptionId
        };
        let getSubData = await Dao.findOne(Models.subscriptionLogs, criteria, {}, {lean: true});
        if (getSubData) {
            let update = {
                textColor: payload.textColor,
                ...(payload.textNameSize && {textNameSize: payload.textNameSize}),
                ...(payload.textDescriptionSize && {textDescriptionSize: payload.textDescriptionSize})
            };
            return await Dao.findAndUpdate(Models.subscriptionLogs, criteria, update, {lean: true, new: true})
        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
    } catch (e) {
        throw e
    }
};

const deleteCommonServices = async (payload, userData)=>{
    try{
        return await Helpers.deleteCommonData(payload, userData, Models.commonServices)
    }catch (e) {
        throw e
    }
};
const deleteCategory = async (payload, userData)=>{
    try{
        return await Helpers.deleteCommonData(payload, userData, Models.categories)
    }catch (e) {
        throw e
    }
};

const deletePlan = async (payload, userData)=>{
    try{
        return await Helpers.deleteCommonData(payload, userData, Models.plans)
    }catch (e) {
        throw e
    }
};

const listContactUsIssue = async (payload, userData)=>{
    try{
        let criteria = {
            ...(payload.type && {type: payload.type})
        };
        if(!payload.type){
            criteria.$or = [{
                type: {$exists: true}
            }, {type: {$ne: APP_CONSTANTS.REPORT_TYPE.FEED}}]
        }
        let option = {
            lean: true,
            sort: {_id: -1},
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
        }
        let [data, count] = await Promise.all([
            Dao.populateData(Models.commonReports, criteria,{} ,option,[{
                path: 'reportBy',
                select: 'firstName lastName name email vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }]),
            Dao.countDocuments(Models.commonReports, criteria)
        ])
        return {data, count}
    }catch (e) {
        throw e
    }
};

const listDowngradeRequests = async (payload, userData)=>{
    try{
        let options = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            sort: {
                _id: -1
            },
            lean: true
        }

        let [data, count] = await Promise.all([
            Dao.populateData(Models.planDowngradeRequests, {
                status: {
                    $ne: APP_CONSTANTS.STATUS_ENUM.DELETED
                }
            }, {}, options, [{
                path: 'vendor',
                select: 'firstName lastName vendorRegisterName email',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }, {
                path: 'requiredPlan',
                select: 'name title description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
            }, {
                path: 'currentPlan',
                select: 'name title description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
            }]), 
            Dao.countDocuments(Models.planDowngradeRequests, {
                status: {
                    $ne: APP_CONSTANTS.STATUS_ENUM.DELETED
                }
            })
        ])
        return {
            data, count
        }
    }catch(e){
        throw e
    }
}


const listDiscount = async (payload, userData)=>{
    try{
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            type : APP_CONSTANTS.PROMO_TYPE.PROMO,
        }
        if(payload.status){
            if(payload.status === APP_CONSTANTS.DISCOUNT_STATUS.ACTIVE){
                criteria.expiryDate = {
                    $gte: +new Date()
                }
            }
            else if(payload.status === APP_CONSTANTS.DISCOUNT_STATUS.EXPIRED){
                criteria.expiryDate= {
                    $lt: +new Date()
                }
            }
        }
        let options = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            sort: {
                _id: 1
            },
            lean: true
        }
        if(payload.startDate && payload.endDate){
            criteria.expiryDate = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        } 
        if(payload.search){
            criteria.$and = [
                {code: new RegExp(await UniversalFunctions.escapeRegex(payload.search), "i")},
                {"name.en": new RegExp(await UniversalFunctions.escapeRegex(payload.search), "i")},
                {"description.en": new RegExp(await UniversalFunctions.escapeRegex(payload.search), "i")},
            ]
        }
        let populate = [{
            path : "vendor",
            select: {
                vendorRegisterName: 1,
                firstName: 1,
                lastName: 1
            }
        }]
        let [data,count] = await Promise.all([
            Dao.populateData(Models.offerAndPromo, criteria,{}, options, populate),
            Dao.countDocuments(Models.offerAndPromo, criteria)
        ])
        return {data, count}
    }catch(e){
        throw e;
    }
}

const currencyListing = async (payload, userData)=>{
    try{
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
        };
        let options = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            lean: true,
        }
        if(payload.search){
            criteria.$or= [{
                from: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')
            },{
                to: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')
            }]
        }
        let [data, count] = await Promise.all([
            Dao.getData(Models.currencies, criteria, {}, options),
            Dao.countDocuments(Models.currencies, criteria)
        ])
        return {data, count}
    }catch(e){
        throw e
    }
}

const addOrEditCurrency = async (payload, userData)=>{
    try{
        if(payload.currencyId){
            let checkCurrency= await Dao.findOne(Models.currencies, {
                from: payload.from,
                to: payload.to,
                _id: {$ne: payload.currencyId}
            }, {}, {lean: true})
            if(checkCurrency){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_CURRENCY
            }    
            return await updateCurrency({_id: payload.currencyId}, payload, userData, Models.currencies)
        }
        else{
            let checkCurrency= await Dao.findOne(Models.currencies, {
                from: payload.from,
                to: payload.to
            }, {}, {lean: true})
            if(checkCurrency){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_CURRENCY
            }            
            return await saveCurrency(payload, userData, Models.currencies)
        }
    }catch(e){
        throw e
    }
}

const saveCurrency = async (payload, userData, model) => {
    payload.createdDate = +new Date();
    payload.updatedDate = +new Date();
    return await Dao.saveData(model, payload);
};

const updateCurrency = async (criteria, payload, userData,model) => {
    payload.updatedDate = +new Date();
    return await Dao.findAndUpdate(model, criteria, payload, {lean: true, new: true});
};


const sendEmail = async (payload)=>{
    try{
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }
        if(payload.selectedId){
            criteria._id= {$in: payload.selectedId}
        }
        let data = await Dao.getData(Models.newsLetters, criteria, {}, {
            lean: true,
        });
        if(data.length){
            setTimeout(async ()=>{
                for(let key of data){
                    key.content = payload.content;
                    key.subject = payload.subject;
                    await EmailHelper.newsLetterEmail(key, payload)
                }
            }, 1000)
        }
        return {}
    }catch (e){
        throw e
    }
}

module.exports = {
    addCategory: addCategory,
    listCategories: listCategories,
    addCommonService: addCommonService,
    listCommonServices: listCommonServices,
    addPlan: addPlan,
    listPlans: listPlans,
    listSubCategories: listSubCategories,
    blockUnblockCategory: blockUnblockCategory,
    blockUnblockSubscription: blockUnblockSubscription,
    blockCommonService: blockCommonService,
    blockUnblockPlan: blockUnblockPlan,
    addTemplateCategory: addTemplateCategory,
    listTemplateCategories: listTemplateCategories,
    testPush: testPush,
    listNewsLetterSubscriber: listNewsLetterSubscriber,
    listSubscriptions: listSubscriptions,
    approveSubscription: approveSubscription,
    updateSubscription: updateSubscription,
    deleteCommonServices: deleteCommonServices,
    deleteCategory: deleteCategory,
    deletePlan: deletePlan,
    listContactUsIssue: listContactUsIssue,
    listDowngradeRequests: listDowngradeRequests,
    listDiscount: listDiscount,
    currencyListing:  currencyListing,
    addOrEditCurrency: addOrEditCurrency,
    sendEmail: sendEmail
};
