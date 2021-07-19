const Dao = require('../dao').queries;
const Models = require('../models');
const RESPONSE_MESSAGES = require('../config/constants').responseMessages;
const APP_CONSTANTS = require('../config').constants.appDefaults;
const CONSTANTS = require('../config').storageConf;
const CourierManager = require('../lib/courier-manager');
const PaytabsManager = require('../lib/paytab-manager');
const UniversalFunctions = require('../utils/universal-functions');
const NotificationManager = require('../lib/notification-manager');
const nodeSchedule = require('node-schedule');
const request = require('request');
const Path = require('path');
const moment = require('moment');
const fs = require('fs');
var countries = require("i18n-iso-countries");

const {APIGateway} = require('aws-sdk');
const EmailHandler = require('../api/email-helpers/emailHandler');

const updateCurrency = async () => {
    try {
        let url = `http://apilayer.net/api/live?access_key=c9b844d11a82694970d7870e6b05ab5e`;
        let result = await doRequest(url);
        if (result && result.quotes) {
            for (let key in result.quotes) {
                console.log("KEY", key, result.quotes[key])
                let fromKey = "USD";
                let toKey = key.substr(3, 10);
                console.log("toKeytoKey", toKey)
                console.log("fromKey", fromKey)
                let conversion = result.quotes[key];
                let reverseConversion = 1 / result.quotes[key]
                console.log("conversion", conversion)
                console.log("reverseConversion", reverseConversion)
                let findCurrency = await Dao.findOne(Models.currencies, {from: fromKey, to: toKey});
                if (!findCurrency) {
                    let saveCurrency = await Dao.saveData(Models.currencies, {
                        from: fromKey,
                        to: toKey,
                        conversion: conversion,
                        reverseConversion: reverseConversion
                    });
                } else {
                    await Dao.findAndUpdate(Models.currencies, {_id: findCurrency._id}, {
                        conversion: conversion,
                        reverseConversion: reverseConversion
                    });
                }
            }
        }

        return {}
    } catch (e) {
        console.log(e)
    }
}


function doRequest(url) {
    return new Promise(function (resolve, reject) {
        console.log("==========data=====")
        request.get(url, function (error, res, body) {
            console.log("=========error========", error, body);
            if (error) reject(error);
            if (!error && body) {
                body = JSON.parse(body)
            }
            if (!error) {
                console.log("=======body===========", body)
                resolve(body);
            } else {
                console.log("error     ", error);
                reject(body);
            }
        });
    });
}

let expireSubscription = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 */1 * * *', async () => {
        let current = +new Date();
        let criteria = {
            logType: {$ne: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED},
            type: {$ne: APP_CONSTANTS.PLAN_TYPE.NORMAL},
            endDate: {$gte: current}
        };
        let subData = await Dao.getData(Models.subscriptionLogs, criteria, {
            logType: 1,
            startDate: 1,
            endDate: 1,
            type: 1,
            vendor: 1
        }, {lean: true});
        if (subData.length) {
            for (let key of subData) {
                let dataToUpdate = {
                    logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED,
                    status: APP_CONSTANTS.STATUS_ENUM.INACTIVE,
                    updatedDate: +new Date()
                };
                let populate = [{
                    path: 'vendor',
                    select: 'name vendorRegisterName'
                }];
                if (key.type !== APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE) {
                    await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                        new: true,
                        lean: true
                    }, populate)
                    let updateVendor = {}
                    switch (key.type) {
                        case APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER:
                            updateVendor = {
                                discountOfferPlan: null
                            }
                            break;
                        case APP_CONSTANTS.PLAN_TYPE.ELITE_AD:
                            updateVendor = {
                                eliteAdPlan: null
                            }
                            break;
                        case APP_CONSTANTS.PLAN_TYPE.NORMAL:
                            updateVendor = {
                                subscription: null
                            }
                            break;
                        case APP_CONSTANTS.PLAN_TYPE.PLUS_CARD:
                            updateVendor = {
                                plusCardPlan: null
                            }
                            break;
                        case APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE:
                            updateVendor = {
                                redirectionPlan: null
                            }
                            break;
                    }
                    console.log({updateVendor, key})
                    await Dao.findAndUpdate(Models.vendors, {_id: key.vendor}, updateVendor, {
                        new: true,
                        lean: true
                    })
                } else {
                    var a = moment(key.endDate);
                    var b = moment();
                    let difference = a.diff(b, 'days')
                    if (difference >= 7) {
                        await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                            new: true,
                            lean: true
                        }, populate)
                        let updateVendor = {}
                        switch (key.type) {
                            case APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER:
                                updateVendor = {
                                    discountOfferPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.ELITE_AD:
                                updateVendor = {
                                    eliteAdPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.NORMAL:
                                updateVendor = {
                                    subscription: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.PLUS_CARD:
                                updateVendor = {
                                    plusCardPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE:
                                updateVendor = {
                                    redirectionPlan: null
                                }
                                break;
                        }
                        console.log({updateVendor, key})
                        await Dao.findAndUpdate(Models.vendors, {_id: key.vendor}, updateVendor, {
                            new: true,
                            lean: true
                        })
                    }
                }

            }
            return {}
        } else return {}
    });

};


let expireSubscriptionAndSendEmails = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 */1 * * *', async () => {
        // let timeOutCron = nodeSchedule.scheduleJob('* * * * *', async () => {
        console.log("Running Expire Subscription cron");
        let current = +new Date();
        let criteria = {
            logType: {$ne: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED},
            // type: {$ne: APP_CONSTANTS.PLAN_TYPE.NORMAL},
            // endDate: {$gte: current}
        };
        let subData = await Dao.populateData(Models.subscriptionLogs, criteria, {
            _id: 1,
            logType: 1,
            startDate: 1,
            endDate: 1,
            type: 1,
            vendor: 1,
            pt_customer_email: 1,
            pt_customer_password: 1,
            pt_token: 1,
            transactionId: 1,
            emailAndNotificationSent: 1
        }, {lean: true}, [{
            path: 'vendor',
            select: 'name vendorRegisterName email deviceToken deviceType language userType autoRenewal phoneNumber durationType'
        }, {
            path: 'plan'
        }]);
        if (subData.length) {
            for (let key of subData) {
                let a = moment(key.endDate);
                let b = moment();
                let difference = a.diff(b, 'days')

                if (difference <= 10 && difference > 0) {
                    if (key.emailAndNotificationSent && key.emailAndNotificationSent.some(item => item === APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_ABOUT_TO_EXPIRE) === false) {
                        let content = 'Your subscription is about to expire';
                        let subject = 'Subscription update';
                        let type = 'Manual';
                        if (key.type === APP_CONSTANTS.PLAN_TYPE.NORMAL) {
                            if (key.vendor.autoRenewal) {
                                type = 'Auto'
                            }
                        }

                        await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content, type , 10, key.vendor.vendorRegisterName);
                        let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.SUBSCRIPTION_ABOUT_TO_EXPIRE;
                        let notificationData = {
                            savePushData: {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SUBSCRIPTION_ABOUT_TO_EXPIRE,
                                message: notificationMessageReceiver,
                                receiver: key.vendor._id,
                                createdDate: +new Date(),
                                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SUBSCRIPTION_ABOUT_TO_EXPIRE
                            },
                            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                            sendPushData: {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SUBSCRIPTION_ABOUT_TO_EXPIRE[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SUBSCRIPTION_ABOUT_TO_EXPIRE[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN]
                            },
                            deviceToken: key.vendor.deviceToken
                        };

                        // await NotificationManager.sendNotifications(notificationData, true);

                        let dataToUpdate = {
                            $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_ABOUT_TO_EXPIRE}
                        };

                        let populate = [{
                            path: 'vendor',
                            select: 'name vendorRegisterName'
                        }];
                        await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                            new: true,
                            lean: true
                        }, populate)
                    }
                } else if (difference <= 0) {
                    if (key.type === APP_CONSTANTS.PLAN_TYPE.NORMAL) {
                        if (!key.vendor.autoRenewal) {
                            await expireSub(key, "Manual")
                        } else {
                            if (key.pt_customer_email && key.pt_customer_password && key.pt_token) {
                                let transaction = await Dao.findOne(Models.transactions, {
                                    _id: key.transactionId
                                }, {
                                    amountWithTax: 1,
                                    pt_customer_password: 1,
                                    pt_customer_email: 1,
                                    pt_token: 1
                                }, {lean: true})
                                let result = await tokenizedSubPayment(key, key.vendor, transaction)
                                if (result && result.response_code == 100) {
                                    await renewSub(result, key, key.plan, transaction)
                                } else {
                                    await expireSub(key, "Manual")
                                }
                            }
                        }
                    } else {
                        await expireSub(key, "Manual")
                    }
                }
            }
            return {}
        } else return {}
    });

};

let expireSub = async (key, type) => {
    let content = 'Your subscription has been expired';
    let subject = 'Subscription update'
    await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content, type, 0 , key.vendor.vendorRegisterName)

    let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.SUBSCRIPTION_EXPIRED
    let notificationData = {
        savePushData: {
            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SUBSCRIPTION_EXPIRED,
            message: notificationMessageReceiver,
            receiver: key.vendor._id,
            createdDate: +new Date(),
            receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED
        },
        type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
        deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
        sendPushData: {
            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SUBSCRIPTION_EXPIRED[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
            message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED
        },
        deviceToken: key.vendor.deviceToken
    };

    await NotificationManager.sendNotifications(notificationData, true);


    let dataToUpdate = {
        logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED,
        status: APP_CONSTANTS.STATUS_ENUM.INACTIVE,
        updatedDate: +new Date(),
        $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_EXPIRED}
    };
    console.log("key", key, "dataToUpdate", dataToUpdate)
    let populate = [{
        path: 'vendor',
        select: 'name vendorRegisterName'
    }];

    await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
        new: true,
        lean: true
    }, populate)
    let updateVendor = {}
    switch (key.type) {
        case APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER:
            updateVendor = {
                discountOfferPlan: null
            }
            break;
        case APP_CONSTANTS.PLAN_TYPE.ELITE_AD:
            updateVendor = {
                eliteAdPlan: null
            }
            break;
        case APP_CONSTANTS.PLAN_TYPE.NORMAL:
            updateVendor = {
                subscription: null
            }
            break;
        case APP_CONSTANTS.PLAN_TYPE.PLUS_CARD:
            updateVendor = {
                plusCardPlan: null
            }
            break;
        case APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE:
            updateVendor = {
                redirectionPlan: null
            }
            break;
    }
    console.log({updateVendor, key})
    await Dao.findAndUpdate(Models.vendors, {_id: key.vendor}, updateVendor, {
        new: true,
        lean: true
    })
}


let renewSub = async (result, key, planData, trans) => {
    // let content = 'Your subscription has been renewed';
    // let subject = 'Subscription update'
    // await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content)

    let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.PLAN_UPDATE;
    let notificationData = {
        savePushData: {
            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.PLAN_UPDATE,
            message: notificationMessageReceiver,
            receiver: key.vendor._id,
            createdDate: +new Date(),
            receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PLAN_UPDATE
        },
        type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
        deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
        sendPushData: {
            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.PLAN_UPDATE[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
            message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PLAN_UPDATE
        },
        deviceToken: key.vendor.deviceToken
    };

    // await NotificationManager.sendNotifications(notificationData, true);


    let dataToUpdate = {
        logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED,
        status: APP_CONSTANTS.STATUS_ENUM.INACTIVE,
        updatedDate: +new Date(),
        $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_EXPIRED}
    };
    let populate = [{
        path: 'vendor',
        select: 'name vendorRegisterName'
    }];

    await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
        new: true,
        lean: true
    }, populate)

    let dataToSaveTransaction = {
        vendor: key.vendor._id,
        plan: planData._id,
        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
        tax: 0,
        amount: trans.amountWithTax,
        amountWithTax: trans.amountWithTax,
        currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
        status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
        transactionId: result.transaction_id,
        pt_customer_password: trans.pt_customer_password,
        pt_customer_email: trans.pt_customer_email,
        pt_token: trans.pt_token,
        createdDate: +new Date(),
        updatedDate: +new Date(),
    };

    let saveTransaction = await Dao.saveData(Models.transactions, dataToSaveTransaction);
    let payload = {
        startDate: +new Date(),
        durationType: key.durationType
    }
    let subsData = await saveSubscription(planData, payload, key.vendor, saveTransaction);
    return subsData
}


let saveSubscription = async (planData, payload, userData, transactionDetails) => {
    try {
        let dataToSave = {
            plan: planData._id,
            type: planData.type ? planData.type : APP_CONSTANTS.PLAN_TYPE.NORMAL,
            transactionId: transactionDetails._id,
            pt_customer_email: transactionDetails.pt_customer_email,
            pt_customer_password: transactionDetails.pt_customer_password,
            pt_token: transactionDetails.pt_token,
            vendor: userData._id,
            logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.BOUGHT,
            onModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            startDate: payload.startDate ? +moment(payload.startDate).startOf('day')._d : +moment(),
            endDate: +moment().add(1, 'month').endOf('day')._d,
            ...(planData.discountOffer && {discountOffer: planData.discountOffer}),
            ...(planData.type && {type: planData.type}),
            ...(planData.clicks && {clicks: planData.clicks}),
            ...(planData.freeClicks && {freeClicks: planData.freeClicks}),
            ...(planData.autoApproval && {isAdminApproved: true})
        };

        if (planData.clicks) {
            dataToSave.totalClicks = planData.clicks;
            if (planData.freeClicks) {
                dataToSave.totalClicks += planData.freeClicks
            }
        }
        let durationType = "days";
        if (planData.validity) {

            if (planData.durationType) {
                dataToSave.durationType = planData.durationType
                if (planData.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.DAY) {
                    durationType = "days"
                }
                if (planData.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH) {
                    durationType = "month"
                }
                if (planData.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR) {
                    durationType = "years"
                }
            }
            if (payload.durationType) {
                dataToSave.durationType = payload.durationType
                if (payload.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.DAY) {
                    durationType = "days"
                }
                if (payload.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.MONTH) {
                    durationType = "month"
                }
                if (payload.durationType === APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR) {
                    durationType = "years"
                }
            }
            dataToSave.endDate = +moment(dataToSave.startDate).add(planData.validity, durationType).endOf('day')._d
        }


        // await Dao.update(Models.subscriptionLogs, {
        //     vendor: userData._id,
        // }, {logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED}, {multi: true, new: true});

        let sub = await Dao.saveData(Models.subscriptionLogs, dataToSave);
        await Dao.findAndUpdate(Models.transactions, {_id: transactionDetails._id}, {$set: {subscriptionLogId: sub._id,}});
        let dataToUpdate = {
            subscription: {
                plan: planData._id,
                subscriptionLogId: sub._id,
                startDate: dataToSave.startDate,
                endDate: dataToSave.endDate,
                durationType: payload.durationType ? payload.durationType : planData.durationType,
                type: APP_CONSTANTS.PLAN_TYPE.NORMAL
            }
        };
        if (planData.type) {
            if (planData.type === APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER) {
                dataToUpdate = {
                    discountOfferPlan: {
                        plan: planData._id,
                        subscriptionLogId: sub._id,
                        startDate: dataToSave.startDate,
                        endDate: dataToSave.endDate,
                        durationType: payload.durationType ? payload.durationType : planData.durationType,
                        type: planData.type
                    }
                }
            } else if (planData.type === APP_CONSTANTS.PLAN_TYPE.ELITE_AD) {
                dataToUpdate = {
                    eliteAdPlan: {
                        plan: planData._id,
                        subscriptionLogId: sub._id,
                        startDate: dataToSave.startDate,
                        endDate: dataToSave.endDate,
                        durationType: payload.durationType ? payload.durationType : planData.durationType,
                        type: planData.type
                    }
                }
            } else if (planData.type === APP_CONSTANTS.PLAN_TYPE.PLUS_CARD) {
                dataToUpdate = {
                    plusCardPlan: {
                        plan: planData._id,
                        subscriptionLogId: sub._id,
                        startDate: dataToSave.startDate,
                        endDate: dataToSave.endDate,
                        durationType: payload.durationType ? payload.durationType : planData.durationType,
                        type: planData.type
                    }
                }
            } else if (planData.type === APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE) {
                dataToUpdate = {
                    redirectionPlan: {
                        plan: planData._id,
                        subscriptionLogId: sub._id,
                        startDate: dataToSave.startDate,
                        endDate: dataToSave.endDate,
                        durationType: payload.durationType ? payload.durationType : planData.durationType,
                        type: planData.type
                    }
                }
                // let deletePreviousCommonLog = await Dao.updateMany(Models.commonLogs, {
                //     vendor: userData._id,
                //     type: APP_CONSTANTS.COMMON_LOGS.REDIRECTION
                // }, {status: APP_CONSTANTS.STATUS_ENUM.DELETED})
            }
        }

        let populate = [
            {
                path: 'subscription.plan',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
            },
            {
                path: 'subscription.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'discountOfferPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'plusCardPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'eliteAdPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'redirectionPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            }
        ];
        let vendorData = await Dao.findAndUpdateWithPopulate(Models.vendors, {_id: userData._id}, dataToUpdate, {
            lean: true,
            new: true
        }, populate);

        return vendorData
    } catch (e) {
        throw e
    }
};


let sendNotificationAndEmailForClicks = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 */1 * * *', async () => {
        let current = +new Date();
        let criteria = {
            logType: {$ne: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED},
            type: {$eq: APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE},
        };
        let populate = [{
            path: 'vendor',
            select: 'name vendorRegisterName language userType deviceType deviceToken'
        }];
        let subData = await Dao.populateData(Models.subscriptionLogs, criteria, {
            logType: 1,
            startDate: 1,
            endDate: 1,
            type: 1,
            totalClicks: 1,
            vendor: 1,
            emailAndNotificationSent: 1
        }, {lean: true}, populate);
        if (subData.length) {
            for (let key of subData) {

                let totalClicksVendor = await Dao.aggregateData(Models.commonLogs, [{
                    $match: {
                        type: APP_CONSTANTS.COMMON_LOGS.REDIRECTION,
                        vendor: key.vendor._id
                    }
                },
                    {
                        $group: {
                            _id: null,
                            visitors: {
                                $sum: "$visitor"
                            }
                        }
                    }
                ]);

                if (totalClicksVendor[0]) {
                    if (totalClicksVendor[0].visitors && totalClicksVendor[0].visitors < key.totalClicks) {
                        let consumedClicks = totalClicksVendor[0].visitors;
                        let consumedPercentage = (consumedClicks.key.totalClicks) * 100;
                        if (consumedPercentage >= 80) {
                            if (key.emailAndNotificationSent && key.emailAndNotificationSent.some(APP_CONSTANTS.NOTIFICATION_LOGS["80_PERCENT"]) === false) {
                                let content = '80% of your redirection clicks have been consumed';
                                let subject = 'Redirection plan update';
                                await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content)

                                let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.REDIRECTION_80_PERCENT;
                                let notificationData = {
                                    savePushData: {
                                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_80_PERCENT,
                                        message: notificationMessageReceiver,
                                        receiver: key.vendor._id,
                                        createdDate: +new Date(),
                                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_80_PERCENT
                                    },
                                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                                    sendPushData: {
                                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_80_PERCENT[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                        message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_80_PERCENT[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN]
                                    },
                                    deviceToken: key.vendor.deviceToken
                                };

                                await NotificationManager.sendNotifications(notificationData, true);

                                let dataToUpdate = {
                                    $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS["80_PERCENT"]}
                                };

                                await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                                    new: true,
                                    lean: true
                                }, populate)
                            }
                        } else if (consumedPercentage >= 90) {
                            if (key.emailAndNotificationSent && key.emailAndNotificationSent.some(APP_CONSTANTS.NOTIFICATION_LOGS["90_PERCENT"]) === false) {
                                let content = '90% of your redirection clicks have been consumed';
                                let subject = 'Redirection plan update';
                                await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content)

                                let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.REDIRECTION_90_PERCENT
                                let notificationData = {
                                    savePushData: {
                                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_90_PERCENT,
                                        message: notificationMessageReceiver,
                                        receiver: key.vendor._id,
                                        createdDate: +new Date(),
                                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_90_PERCENT
                                    },
                                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                                    sendPushData: {
                                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_90_PERCENT[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                        message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_90_PERCENT[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN]
                                    },
                                    deviceToken: key.vendor.deviceToken
                                };

                                await NotificationManager.sendNotifications(notificationData, true);

                                let dataToUpdate = {
                                    $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS["90_PERCENT"]}
                                };

                                await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                                    new: true,
                                    lean: true
                                }, populate)
                            }
                        }
                    } else if (totalClicksVendor[0].visitors && totalClicksVendor[0].visitors >= key.totalClicks) {
                        let content = 'Your redirection plan is expired because total clicks have been consumed';
                        let subject = 'Redirection plan update'
                        await EmailHandler.expiredSubscriptionEmail(subject, key.vendor.email, content)

                        let notificationMessageReceiver = APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.REDIRECTION_CONSUMED
                        let notificationData = {
                            savePushData: {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_CONSUMED,
                                message: notificationMessageReceiver,
                                receiver: key.vendor._id,
                                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                createdDate: +new Date(),
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_CONSUMED
                            },
                            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                            sendPushData: {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.REDIRECTION_CONSUMED[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                message: notificationMessageReceiver[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REDIRECTION_CONSUMED[key.vendor.language ? key.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN]
                            },
                            deviceToken: key.vendor.deviceToken
                        };

                        await NotificationManager.sendNotifications(notificationData, true);


                        let dataToUpdate = {
                            logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED,
                            status: APP_CONSTANTS.STATUS_ENUM.INACTIVE,
                            updatedDate: +new Date(),
                            $addToSet: {emailAndNotificationSent: APP_CONSTANTS.NOTIFICATION_LOGS.EMAIL_EXPIRED}
                        };
                        let populate = [{
                            path: 'vendor',
                            select: 'name vendorRegisterName'
                        }];

                        await Dao.findAndUpdateWithPopulate(Models.subscriptionLogs, {_id: key._id}, dataToUpdate, {
                            new: true,
                            lean: true
                        }, populate)
                        let updateVendor = {}
                        switch (key.type) {
                            case APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER:
                                updateVendor = {
                                    discountOfferPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.ELITE_AD:
                                updateVendor = {
                                    eliteAdPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.NORMAL:
                                updateVendor = {
                                    subscription: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.PLUS_CARD:
                                updateVendor = {
                                    plusCardPlan: null
                                }
                                break;
                            case APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE:
                                updateVendor = {
                                    redirectionPlan: null
                                }
                                break;
                        }
                        console.log({updateVendor, key})
                        await Dao.findAndUpdate(Models.vendors, {_id: key.vendor}, updateVendor, {
                            new: true,
                            lean: true
                        })
                    }
                }
            }
            return {}
        } else return {}
    });
};

const resetDailyVisits = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 0 * * *', async () => {
        console.log("Inside reset Daily Visits")
        try {
            let promise = await Promise.all([
                Dao.updateMany(Models.products, {}, {dailyVisits: 0, dailyLikes: 1}, {multi: true}),
                Dao.updateMany(Models.vendors, {}, {dailyVisits: 0, dailyLikes: 1}, {multi: true}),
                Dao.updateMany(Models.categories, {}, {dailyVisits: 0}, {multi: true}),
                Dao.updateMany(Models.productVariants, {}, {dailyVisits: 0}, {multi: true}),
                Dao.updateMany(Models.feeds, {}, {dailyLikes: 0, dailyComments: 0}, {multi: true}),
                // updateCurrency()
            ])
        } catch (e) {
            console.log("Error in reset DailyVisits", e)
        }
    })

}

const checkCourierStatus = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 */6 * * *', async () => {
        let getOrders = await Dao.getData(Models.orders, {
            $or: [{
                $and: [{trackingId: {$ne: ""}}, {trackingId: {$exists: true}}],
                $or: [{trackingIdReturn: ""}, {trackingIdReturn: {$exists: false}}],
                status: {$nin: [/*APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,*/ APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED, APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED, APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED]}
            }/*,
                {
                    $and: [{trackingIdReturn: {$ne: ""}}, {trackingIdReturn: {$exists: true}}],
                    status: {$ne: APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED}
                }*/],
            noDelivery: false
        }, {
            trackingIdReturn: 1,
            trackingId: 1,
            courierCompany: 1,
            noDelivery: 1,
            status: 1
        });
        await changeCourierStatus(getOrders)
    })
};

const checkCourierStatusReturn = async () => {
    let timeOutCron = nodeSchedule.scheduleJob('0 */6 * * *', async () => {
        let getOrders = await Dao.getData(Models.orders, {
            $or: [/*{
                $and: [{trackingId: {$ne: ""}}, {trackingId: {$exists: true}}],
                $or: [{trackingIdReturn: ""}, {trackingIdReturn: {$exists: false}}],
                status: {$nin: [/!*APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,*!/ APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED, APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED, APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED]}
            },*/
                {
                    $and: [{trackingIdReturn: {$ne: ""}}, {trackingIdReturn: {$exists: true}}],
                    status: {$ne: APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED}
                }],
            noDelivery: false
        }, {
            trackingIdReturn: 1,
            trackingId: 1,
            courierCompany: 1,
            noDelivery: 1,
            status: 1
        });
        await changeCourierStatus(getOrders)
    })
};

const changeCourierStatus = async (orders)=>{
    try{
        let data = fs.readFileSync(Path.resolve('./utils/tracking-status.json'), 'utf8');
        let trackingStatuses = JSON.parse(data);


        console.log("getOrdersgetOrders", orders.length)
        if (orders.length) {
            for (let order of orders) {
                console.log("order", order)
                let referenceNumber;
                if ((!order.trackingIdReturn || order.trackingIdReturn === "") && order.trackingId) {
                    console.log("order.trackingId", order.trackingId)
                    referenceNumber = order.trackingId;
                    let courierData = await CourierManager.postShippingTrack(referenceNumber);
                    if (courierData.TrackingDetail && courierData.TrackingDetail.length) {
                        let dataToUpdate = {
                            trackingLogs: courierData.TrackingDetail
                        }
                        let lastStatus = courierData.TrackingDetail[courierData.TrackingDetail.length - 1]
                        dataToUpdate.trackingStatus = lastStatus.TrackingEventCode
                        dataToUpdate.trackingStatusCode = lastStatus.TrackingEventName
                        let orderStatus = await mapOrderStatus(lastStatus, trackingStatuses)
                        if (orderStatus) {
                            dataToUpdate.status = orderStatus;
                            if (orderStatus === APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED || orderStatus === APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED) {

                            }
                        }
                        console.log("order._id", order._id, dataToUpdate)
                        let orderData = await Dao.findAndUpdate(Models.orders, {_id: order._id}, dataToUpdate, {lean: true}, [{
                            path: 'user',
                            select: 'firstName lastName email deviceToken deviceType language phoneNumber',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }, {
                            path: 'products.product',
                            select: 'title images weight unit',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
                        }, {
                            path: 'products.color',
                            select: 'name',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                        }, {
                            path: 'products.size',
                            select: 'name',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                        }, {
                            path: 'products.productVariant',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                            populate: [{
                                path: 'colors',
                                select: 'name',
                                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                            }, {
                                path: 'sizes',
                                select: 'name',
                                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                            }]
                        }, {
                            path: 'vendor',
                            select: 'vendorRegisterName',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                        }])
                        let updateTransaction = {}
                        let transaction = await Dao.findAndUpdate(Models.transactions, {order: orderData._id}, updateTransaction, {})
                        if(dataToUpdate.status !== order.status){
                            await sendEmailChangeStatus(orderData.status, orderData, {}, transaction)
                            setTimeout(async () => {
                                await sendNotificationChangeStatus(orderData.status, orderData, {})
                            }, 1000)
                        }

                    }

                }
                else if (order.trackingIdReturn || order.trackingIdReturn !== "") {
                    referenceNumber = order.trackingIdReturn;
                    let courierData = await CourierManager.postShippingTrack(referenceNumber)
                    if (courierData.TrackingDetail && courierData.TrackingDetail.length) {
                        let dataToUpdate = {
                            trackingLogsReturn: courierData.TrackingDetail
                        }
                        let lastStatus = courierData.TrackingDetail[courierData.TrackingDetail.length - 1];
                        let orderStatus = await mapOrderStatus(lastStatus, trackingStatuses);
                        if (orderStatus && orderStatus === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED) {
                            dataToUpdate.status = APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED;
                            dataToUpdate.refundStatus = APP_CONSTANTS.REFUND_STATUS.COMPLETED;
                            dataToUpdate.returnStatus = APP_CONSTANTS.REFUND_STATUS.COMPLETED;
                        }
                        dataToUpdate.trackingStatusReturn = lastStatus.TrackingEventCode;
                        dataToUpdate.trackingStatusCodeReturn = lastStatus.TrackingEventName;
                        console.log("Return order._id", order._id, dataToUpdate)
                        let orderData = await Dao.findAndUpdate(Models.orders, {_id: order._id}, dataToUpdate, {
                            lean: true,
                            new: true
                        }, [{
                            path: 'user',
                            select: 'firstName lastName email deviceToken deviceType language phoneNumber',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }, {
                            path: 'products.product',
                            select: 'title images weight unit',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
                        }, {
                            path: 'products.color',
                            select: 'name',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                        }, {
                            path: 'products.size',
                            select: 'name',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                        }, {
                            path: 'products.productVariant',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                            populate: [{
                                path: 'colors',
                                select: 'name',
                                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                            }, {
                                path: 'sizes',
                                select: 'name',
                                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                            }]
                        }, {
                            path: 'vendor',
                            select: 'vendorRegisterName',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                        }])
                        let updateTransaction = {}
                        if (orderStatus && orderStatus === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED) {
                            updateTransaction.refundStatus = APP_CONSTANTS.REFUND_STATUS.COMPLETED
                        }
                        let transaction = await Dao.findAndUpdate(Models.transactions, {order: orderData._id}, updateTransaction, {})
                        if (transaction && orderData.status === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED && (transaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || transaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD)) {
                            let refundAmount = await refundOrder(orderData, transaction, `Refund for retuned product`)
                        }
                        if (transaction && orderData.status === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED && (transaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET || transaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY)) {
                            let refundAmountWallet = await refundOrderWallet(orderData, transaction, `Refund for returned product`)

                        }
                        if (orderStatus && orderStatus === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED) {
                            await sendEmailChangeStatus(orderData.status, orderData, {}, transaction)
                            setTimeout(async () => {
                                await sendNotificationChangeStatus(orderData.status, orderData, {}, )
                            }, 1000)
                        }

                    }
                }

            }
        }
        return {}
    }catch (e){
        throw e
    }
}

let sendNotificationChangeStatus = async (status, orderData, userData) => {
    try {

        if (status !== APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED) {
            let userNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
                APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE[status], {
                    orderNumber: orderData.orderNumber,
                    subOrderNumber: orderData.subOrderNumber
                }
            )

            let notificationDataUser = {
                savePushData: {
                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status],
                    message: userNotificationMessage,
                    orderId: orderData.orderId,
                    order: orderData._id,
                    receiver: orderData.user._id,
                    createdDate: +new Date(),
                    receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                    userType: APP_CONSTANTS.USER_TYPE.USER,
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
                },
                type: APP_CONSTANTS.USER_TYPE.USER,
                deviceType: orderData.user.deviceType ? orderData.user.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                sendPushData: {
                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status][orderData.user.language ? orderData.user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    message: userNotificationMessage[orderData.user.language ? orderData.user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    orderId: orderData.orderId,
                    order: orderData._id,
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
                },
                deviceToken: orderData.user.deviceToken
            };

            await NotificationManager.sendNotifications(notificationDataUser, true);

        }

        let vendorNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE[status], {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber
            }
        )

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status],
                message: vendorNotificationMessage,
                orderId: orderData.orderId,
                order: orderData._id,
                createdDate: +new Date(),
                receiver: orderData.vendor._id,
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: orderData.vendor.deviceType ? orderData.vendor.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status][orderData.vendor.language ? orderData.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: vendorNotificationMessage[orderData.vendor.language ? orderData.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: orderData.orderId,
                order: orderData._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
            },
            deviceToken: orderData.vendor.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        //////////////////////////// admin notifications //////////////////////////

        let findAdmins = await Dao.getData(Models.admin, {status: APP_CONSTANTS.STATUS_ENUM.ACTIVE}, {}, {lean: true});

        let adminNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ADMIN_ORDER_UPDATES[status],
            {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber
            }
        )

        if (findAdmins.length) {
            for (let key of findAdmins) {

                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status],
                        message: adminNotificationMessage,
                        orderId: orderData.orderId,
                        order: orderData._id,
                        vendor: userData._id,
                        receiver: key._id,
                        createdDate: +new Date(),
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status][key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminNotificationMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: orderData.orderId,
                        order: orderData._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    deviceToken: key.deviceToken
                };

                await NotificationManager.sendNotifications(notificationDataAdmin, true);
            }
        }
        return {}

    } catch (e) {
        throw e
    }
}


let sendEmailChangeStatus = async (status, orderData, userData, transactions) => {
    try {
        let orderStatus;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED)
            orderStatus = `Cancelled`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED)
            orderStatus = `Delivered`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED)
            orderStatus = `Placed`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED)
            orderStatus = `Dispatched`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT)
            orderStatus = `In Transit`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED)
            orderStatus = `Packed`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED)
            orderStatus = `Confirmed`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY)
            orderStatus = `Attempted delivery`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY)
            orderStatus = `Out for delivery`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE)
            orderStatus = `Unable to locate`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURN_IN_PROGRESS)
            orderStatus = `Shipment returning to sender`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED)
            orderStatus = `Shipment returned to sender`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED)
            orderStatus = `Return completed`;

        let subTotal = transactions.productPrice * transactions.quantity;
        let tax = transactions.productTotalTax;
        let promoAmount = orderData.products.promoCharges;
        let shippingCharges = orderData.products.shippingChargesAfterDiscount * orderData.products.quantity;
        let finalTotal = subTotal + tax + shippingCharges - promoAmount;
        let emailData = {
            status: orderStatus,
            productImage: orderData.products.product.images[0].original,
            websiteUrl: process.env.websiteUrl,
            logoUrl: process.env.logoUrl,
            subOrderNumber: orderData.subOrderNumber,
            createdDate: moment(orderData.createdDate).format('LL'),
            vendorRegisterName: orderData.vendor.vendorRegisterName,
            productName: orderData.products.product.title.en,
            currency: orderData.products.currency,
            productPrice: `${orderData.products.price} * ${orderData.products.quantity}`,
            subTotal: subTotal,
            promoAmount: promoAmount,
            subTotalBeforeTax: `${subTotal + shippingCharges}`,
            subTotalWithTax: `${subTotal + shippingCharges + tax}`,
            shippingCharges: shippingCharges,
            tax: tax,
            finalTotal: finalTotal,
            name: orderData.deliveryAddress && orderData.deliveryAddress.name ? orderData.deliveryAddress.name : "",
            street: orderData.deliveryAddress && orderData.deliveryAddress.street ? orderData.deliveryAddress.street : "",
            building: orderData.deliveryAddress && orderData.deliveryAddress.building ? orderData.deliveryAddress.building : "",
            country: orderData.deliveryAddress && orderData.deliveryAddress.country ? orderData.deliveryAddress.country : "",
            city: orderData.deliveryAddress && orderData.deliveryAddress.city ? orderData.deliveryAddress.city : "",
            state: orderData.deliveryAddress && orderData.deliveryAddress.state ? orderData.deliveryAddress.state : "",
            countryCode: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.countryCode ? orderData.deliveryAddress.contactDetails.countryCode : "",
            phoneNo: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.phoneNo ? orderData.deliveryAddress.contactDetails.phoneNo : ""
        }

        emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2);
        emailData.subTotal = parseFloat(emailData.subTotal).toFixed(2);
        emailData.finalTotal = parseFloat(emailData.finalTotal).toFixed(2);
        emailData.promoAmount = parseFloat(emailData.promoAmount).toFixed(2);
        emailData.tax = parseFloat(emailData.tax).toFixed(2);
        emailData.subTotalBeforeTax = parseFloat(emailData.subTotalBeforeTax).toFixed(2);
        emailData.subTotalWithTax = parseFloat(emailData.subTotalWithTax).toFixed(2);
        emailData.shippingCharges = parseFloat(emailData.shippingCharges).toFixed(2);

        if (orderData.products.color) {
            emailData.color = orderData.products.color.name.en
        }
        if (orderData.products.size) {
            emailData.size = orderData.products.size.name.en
        }
        if (orderData.products.productVariant) {
            if (orderData.products.productVariant.colors) {
                emailData.color = orderData.products.productVariant.colors.name.en
            }
            if (orderData.products.productVariant.sizes) {
                emailData.size = orderData.products.productVariant.sizes.name.en
            }
        }

        let email = orderData.user.email
        let orderId = orderData.orderNumber
        await EmailHandler.sendEmailOrderStatus(emailData, email, orderId)
        return {}
    } catch (e) {
        throw e
    }
}


let mapOrderStatus = async (lastStatus, trackingStatuses) => {
    try {
        let findStatus = trackingStatuses.find(items => {
            return items.EventCode === lastStatus.TrackingEventCode
        })
        if (findStatus) {
            return findStatus.internalStatus
        } else {
            return ""
        }
    } catch (e) {
        throw e
    }
}

const refundOrder = async (order, transaction, refund_reason) => {
    try {
        let data = {
            transaction_id: transaction.transactionId,
            refund_amount: transaction.amountWithTax,
            refund_reason: refund_reason
        }
        let result = await PaytabsManager.refund(data);
        return {}
    } catch (e) {
        throw e
    }
}

let tokenizedSubPayment = async (payload, userData, transaction) => {
    try {

        let iso3;
        if (userData.phoneNumber.ISO) {
            iso3 = countries.alpha2ToAlpha3(userData.phoneNumber.ISO)
        }
        let data = {
            'currency': "AED",      //change this to the required currency
            'amount': transaction.amountWithTax,      //change this to the required amount
            'site_url': process.env.site_url,       //change this to reflect your site
            'title': `Auto Renewal of subscription`,        //Change this to reflect your order title
            // 'quantity': 1,      //Quantity of the product
            // 'unit_price': transaction.amountWithTax,       //Quantity * price must be equal to amount
            // 'products_per_title': `Auto Renewal of subscription`,      //Change this to your products
            // 'return_url': process.env.return_url_wallet,       //This should be your callback url
            'cc_first_name': userData.firstName ? userData.firstName : "NA",        //Customer First Name
            'cc_last_name': userData.lastName ? userData.lastName : "NA",      //Customer Last Name
            'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
            'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
            // 'billing_address': "NA",        //Billing Address
            // 'city': "NA",          //Billing City
            // 'state': "NA",        //Billing State
            // 'postal_code': "NA",     //Postal Code
            // 'country': iso3 ? iso3 : "IND",        //Iso 3 country code
            // 'email': userData.email,        //Customer Email
            // 'ip_customer': 'NA',        //Pass customer IP here
            // 'ip_merchant': 'NA',        //Change this to your server IP
            order_id: +new Date(),
            product_name: "NA",
            customer_email: userData.email,
            address_billing: "NA",
            state_billing: "NA",
            city_billing: "NA",
            postal_code_billing: "NA",
            country_billing: iso3 ? iso3 : "IND",
            'address_shipping': "NA",      //Shipping Address
            'city_shipping': "NA",        //Shipping City
            'state_shipping': "NA",      //Shipping State
            'postal_code_shipping': "NA",
            'country_shipping': iso3 ? iso3 : "IND",
            pt_token: transaction.pt_token,
            pt_customer_email: transaction.pt_customer_email,
            pt_customer_password: await UniversalFunctions.encryptDecrypt(transaction.pt_customer_password, 'decrypt'),
            billing_shipping_details: "NA",
        }
        let result = await PaytabsManager.tokenizedPayment(data);
        console.log("result", result)
        return result
    } catch (e) {
        throw e
    }
}

let refundOrderWallet = async (order, transaction, refund_reason) => {
    try {
        let dataToSave = {
            user: order.user._id,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            amount: transaction.amount,
            amountWithTax: transaction.amountWithTax
        };

        let save = await Dao.saveData(Models.creditManagement, dataToSave);
        let transactionId = await UniversalFunctions.generateRandomOTP();
        let transactionDataToSave = {
            creditId: save._id,
            user: order.user._id,
            transactionType: APP_CONSTANTS.TRANSACTION_TYPES.WALLET_RETURN,
            tax: 0,
            transactionId: transactionId,
            amount: transaction.amount,
            amountWithTax: transaction.amountWithTax,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);

        await Dao.findAndUpdate(Models.user, {_id: order.user._id}, {
            $inc: {walletMoney: transaction.amountWithTax}
        }, {})
        return {}
    } catch (e) {
        throw e
    }
}

// let updateProductPrice = async ()=>{
//     try{
//         let getProductData = await Dao.getData(Models.products, {price: {$ne: null}});
//         let getProductVariantData = await Dao.getData(Models.productVariants, {price: {$ne: null}});
//         if(getProductData.length){
//             for(let prod of getProductData){
//                 await Dao.findAndUpdate(Models.products, {_id: prod._id}, {priceInUSD: prod.price})
//             }
//         }
//         if(getProductVariantData.length){
//             for(let prodV of getProductVariantData){
//                 await Dao.findAndUpdate(Models.productVariants, {_id: prodV._id}, {priceInUSD: prodV.price})
//             }
//         }
//     }catch(e){
//         throw e
//     }
// }


// let updateTransactionPrice = async ()=>{
//     try{
//         let getProductData = await Dao.getData(Models.transactions, {transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER}, {productPrice: 1, quantity: 1, productTotalTax: 1}, {lean: true});
//         if(getProductData.length){
//             for(let prod of getProductData){

//                 if(prod.productPrice && prod.quantity && prod.productTotalTax){
//                     console.log("prodprod", prod)
//                     let dataToUpdate = {
//                         productPriceWithTax: (prod.productPrice * prod.quantity) + prod.productTotalTax
//                     }
//                     await Dao.findAndUpdate(Models.transactions, {_id: prod._id}, dataToUpdate, {lean: true})
//                 }

//             }
//         }
//     }catch(e){
//         throw e
//     }
// }

module.exports = {
    updateCurrency: updateCurrency,
    expireSubscription: expireSubscription,
    sendNotificationAndEmailForClicks: sendNotificationAndEmailForClicks,
    resetDailyVisits: resetDailyVisits,
    checkCourierStatus: checkCourierStatus,
    expireSubscriptionAndSendEmails: expireSubscriptionAndSendEmails,
    checkCourierStatusReturn: checkCourierStatusReturn
};
