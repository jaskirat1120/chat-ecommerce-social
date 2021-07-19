// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const CategoryHelpers = require('../../helper-functions/categories');
const UploadManager = require('../../../lib/upload-manager');
const PayTabManager = require('../../../lib/paytab-manager');
const UniversalFunctions = require('../../../utils/universal-functions');
const EmailHelper = require('../../email-helpers/emailHandler');
const NotificationManager = require('../../../lib/notification-manager');
const moment = require('moment');
var countries = require("i18n-iso-countries");

let listCategories = async (payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        if (payload.parentId && payload.parentId.length)
            payload.subCategory = {$in: payload.parentId};
           let vendorCategory = true
        return await CategoryHelpers.categoryListing(payload, payload.type, status, options, userData, vendorCategory)
    } catch (e) {
        throw e
    }
};

let listCollections = async (payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };

        payload.type = APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS
        payload.addedByVendor = userData._id;

        return await CategoryHelpers.categoryListing(payload, payload.type, status, options, userData)
    } catch (e) {
        throw e
    }
};

let listCommonServices = async (payload, userData) => {
    try {
        payload.status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        let project = {
            name: 1,
            days: 1,
            description: 1,
            media: 1,
            inCoverageArea: 1
        }
        return await CategoryHelpers.listCommonServices(payload, userData, Models.commonServices, project)
    } catch (e) {
        throw e
    }
};


let listPlans = async (payload, userData) => {
    try {
        payload.status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
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

const addCategory = async (payload, userData) => {
    try {
        // if(payload && payload.vendorId){
        //     userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        // }
        payload.addedByVendor = userData && userData._id ? userData._id : null;
        payload.addedBy = null;
        return await Dao.saveData(Models.categories, payload);
    } catch (e) {
        throw e
    }
};


let selectPlan = async (payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let planData = await Dao.findOne(Models.plans, {_id: payload.planId}, {}, {lean: true});
        if (planData) {
            if (payload.subscriptionLogId) {
                return await updateSubscription(planData, payload, userData)
            } else {
                let subsData = await saveSubscription(planData, payload, userData, payload.transactionId);
                let notificationData = await saveNotification(planData, userData)
                await sendEmailSub(planData, userData)
                return subsData;
            }

        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
    } catch (e) {
        throw e
    }
};

let saveNotification = async (planData, userData)=>{
    try{
        let notificationData = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.PLAN_UPDATE,
                message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.PLAN_UPDATE,
                user: userData._id,
                plan: planData._id,
                receiver: userData._id,
                createdDate: +new Date(),
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PLAN_UPDATE
                // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
            },
            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.PLAN_UPDATE[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.PLAN_UPDATE[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PLAN_UPDATE
            },
            deviceToken: userData.deviceToken
        };

        await NotificationManager.sendNotifications(notificationData, true);

    }catch(e){
        throw e
    }
}

let sendEmailSub = async (planData, userData)=>{
    try{
        let subject = `Subscription update`
        await EmailHelper.boughtSubscriptionEmail(subject, userData.email)
        return {}
    }catch (e){
        throw e
    }
}

let saveTransaction = async (planData, payload, userData, transactionId) => {
    try {
        let dataToSave = {
            plan: planData._id,
            vendor: userData._id,
            transactionType: APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
            tax: 0,
            amount: planData.price,
            amountWithTax: planData.price,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            transactionId: transactionId,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        return await Dao.findAndUpdate(Models.transactions, dataToSave)
    } catch (e) {
        throw e
    }
};

let saveSubscription = async (planData, payload, userData, transaction) => {
    try {
        let transactionDetails = await Dao.findOne(Models.transactions, {_id: transaction}, {}, {lean: true});
        let dataToSave = {
            plan: planData._id,
            type: planData.type ? planData.type : APP_CONSTANTS.PLAN_TYPE.NORMAL,
            transactionId: transaction,
            deviceType: userData.deviceType?userData.deviceType:APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            pt_customer_email: transactionDetails?transactionDetails.pt_customer_email:"",
            pt_customer_password: transactionDetails?transactionDetails.pt_customer_password:"",
            pt_token : transactionDetails?transactionDetails.pt_token:"",
            vendor: userData._id,
            logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.BOUGHT,
            onModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            startDate: payload.startDate ? +moment(payload.startDate).startOf('day')._d : +moment(),
            endDate: +moment().add(1, 'month').endOf('day')._d,
            ...(payload.media && {media: payload.media}),
            ...(payload.mediaType && {mediaType: payload.mediaType}),
            ...(payload.name && {name: payload.name}),
            ...(payload.description && {description: payload.description}),
            ...(planData.discountOffer && {discountOffer: planData.discountOffer}),
            ...(planData.type && {type: planData.type}),
            ...(planData.clicks && {clicks: planData.clicks}),
            ...(planData.freeClicks && {freeClicks: planData.freeClicks}),
            ...(planData.autoApproval && {isAdminApproved: true})
        };

        if(planData.clicks){
            dataToSave.totalClicks = planData.clicks;
            if(planData.freeClicks){
                dataToSave.totalClicks += planData.freeClicks
            }
        }
        let durationType = "days";
        if (planData.validity) {

            if (planData.durationType) {
                dataToSave.durationType = planData.durationType;
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
                dataToSave.durationType = payload.durationType;
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
        await Dao.findAndUpdate(Models.transactions, {_id: transaction}, {$set: {subscriptionLogId: sub._id,}});
        let dataToUpdate = {
            subscription: {
                plan: planData._id,
                subscriptionLogId: sub._id,
                startDate: dataToSave.startDate,
                endDate: dataToSave.endDate,
                durationType: payload.durationType?payload.durationType:planData.durationType,
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
                        durationType: payload.durationType?payload.durationType:planData.durationType,
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
                        durationType: payload.durationType?payload.durationType:planData.durationType,
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
                        durationType: payload.durationType?payload.durationType:planData.durationType,
                        type: planData.type
                    }
                }
            }
            else if (planData.type === APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE) {
                dataToUpdate = {
                    redirectionPlan: {
                        plan: planData._id,
                        subscriptionLogId: sub._id,
                        startDate: dataToSave.startDate,
                        endDate: dataToSave.endDate,
                        durationType: payload.durationType?payload.durationType:planData.durationType,
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

let updateSubscription = async (planData, payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let dataToSave = {
            plan: planData._id,
            type: planData.type ? planData.type : APP_CONSTANTS.PLAN_TYPE.NORMAL,
            vendor: userData._id,
            onModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.BOUGHT,
            ...(payload.media && {media: payload.media}),
            ...(payload.mediaType && {mediaType: payload.mediaType}),
            ...(payload.name && {name: payload.name}),
            ...(payload.description && {description: payload.description}),
            ...(payload.discountOffer && {discountOffer: payload.discountOffer}),
            ...(planData.type && {type: planData.type})
        };
        if (payload.startDate) {
            dataToSave.startDate = +moment(payload.startDate).startOf('day')._d;
        }

        console.log("dataToSave.startDatedataToSave.startDate", dataToSave.startDate);

        if (planData.validity && payload.startDate) {
            console.log("planData.validity", planData.validity)
            let durationType = "days";
            if (planData.durationType) {
                dataToSave.durationType = planData.durationType;
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
            if(payload.durationType){
                dataToSave.durationType = payload.durationType;
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
            dataToSave.endDate = +moment(payload.startDate).add(planData.validity, durationType).endOf('day')._d
        }


        // await Dao.update(Models.subscriptionLogs, {
        //     vendor: userData._id,
        // }, {logType: APP_CONSTANTS.SUBSCRIPTION_LOGS.EXPIRED}, {multi: true, new: true});

        let sub = await Dao.findAndUpdate(Models.subscriptionLogs, {_id: payload.subscriptionLogId}, dataToSave, {});
        let dataToUpdate = {};
        if (dataToSave.startDate && dataToSave.endDate) {
            dataToUpdate = {
                subscription: {
                    plan: planData._id,
                    subscriptionLogId: sub._id,
                    startDate: dataToSave.startDate,
                    ...(planData.durationType && {durationType: planData.durationType}),
                    ...(payload.durationType && {durationType: payload.durationType}),
                    endDate: dataToSave.endDate,
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
                            ...(planData.durationType && {durationType: planData.durationType}),
                            ...(payload.durationType && {durationType: payload.durationType}),
                            endDate: dataToSave.endDate,
                            type: planData.type
                        }
                    }
                } else if (planData.type === APP_CONSTANTS.PLAN_TYPE.ELITE_AD) {
                    dataToUpdate = {
                        eliteAdPlan: {
                            plan: planData._id,
                            subscriptionLogId: sub._id,
                            startDate: dataToSave.startDate,
                            ...(planData.durationType && {durationType: planData.durationType}),
                            ...(payload.durationType && {durationType: payload.durationType}),
                            endDate: dataToSave.endDate,
                            type: planData.type
                        }
                    }
                } else if (planData.type === APP_CONSTANTS.PLAN_TYPE.PLUS_CARD) {
                    dataToUpdate = {
                        plusCardPlan: {
                            plan: planData._id,
                            subscriptionLogId: sub._id,
                            startDate: dataToSave.startDate,
                            ...(planData.durationType && {durationType: planData.durationType}),
                            ...(payload.durationType && {durationType: payload.durationType}),
                            endDate: dataToSave.endDate,
                            type: planData.type
                        }
                    }
                }
                else if (planData.type === APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE) {
                    dataToUpdate = {
                        redirectionPlan: {
                            plan: planData._id,
                            subscriptionLogId: sub._id,
                            startDate: dataToSave.startDate,
                            ...(planData.durationType && {durationType: planData.durationType}),
                            ...(payload.durationType && {durationType: payload.durationType}),
                            endDate: dataToSave.endDate,
                            type: planData.type
                        }
                    }
                }
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
            }];
        let vendorData = await Dao.findAndUpdateWithPopulate(Models.vendors, {_id: userData._id}, dataToUpdate, {
            lean: true,
            new: true
        }, populate);

        return vendorData
    } catch (e) {
        throw e
    }
}

let makePaymentPlan = async (payload, userData) => {
    try {
        let planData = await Dao.findOne(Models.plans, {_id: payload.planId}, {_id: 1, price: 1, type: 1, discountAnnualSubscription: 1}, {lean: true});
        let iso3, transactionId, paymentUrl, pId, paymentStatus;
        let amountAfterDiscount = 0;
        if(payload.durationType && payload.durationType ===APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR && planData.price > 0){
            let price = planData.price;
            let yearPrice = price * 12;
            let discount = yearPrice * planData.discountAnnualSubscription / 100;
            amountAfterDiscount = yearPrice - discount;
        }
        else{
            amountAfterDiscount = planData.price;
        }
        if(amountAfterDiscount>0){
            if (userData.phoneNumber.ISO) {
                iso3 = countries.alpha2ToAlpha3(userData.phoneNumber.ISO)
            }
            // let data = {
            //     'currency': "AED",      //change this to the required currency
            //     'amount': amountAfterDiscount,      //change this to the required amount
            //     'site_url': process.env.site_url,       //change this to reflect your site
            //     'title': `Buy Plan by ${userData.firstName} ${userData.lastName}`,        //Change this to reflect your order title
            //     'quantity': 1,      //Quantity of the product
            //     'unit_price': amountAfterDiscount,       //Quantity * price must be equal to amount
            //     'products_per_title': `Subscription payment`,      //Change this to your products
            //     'return_url': process.env.return_url_plan,       //This should be your callback url
            //     'cc_first_name': userData.firstName || "NA",        //Customer First Name
            //     'cc_last_name': userData.lastName || "NA",      //Customer Last Name
            //     'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
            //     'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
            //     'billing_address': "NA",        //Billing Address
            //     'city': "NA",          //Billing City
            //     'state': "NA",        //Billing State
            //     'postal_code': "NA",     //Postal Code
            //     'country': iso3 ? iso3 : "IND",        //Iso 3 country code
            //     'email': userData.email,        //Customer Email
            //     'ip_customer': 'NA',        //Pass customer IP here
            //     'ip_merchant': 'NA',        //Change this to your server IP
            //     'address_shipping': "NA",      //Shipping Address
            //     'city_shipping': "NA",        //Shipping City
            //     'state_shipping': "NA",      //Shipping State
            //     'postal_code_shipping': "NA",
            //     'country_shipping': iso3 ? iso3 : "IND",
            //     'other_charges': 0,        //Other chargs can be here
            //     'reference_no': +new Date(),      //Pass the order id on your system for your reference
            //     'msg_lang': 'en',       //The language for the response
            //     'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
            // };
            // let paymentResult = await PayTabManager.createPage(data);

            let tokenizationData = {
                'currency': "AED",      //change this to the required currency
                'amount': amountAfterDiscount,      //change this to the required amount
                'site_url': process.env.site_url,       //change this to reflect your site
                'title': `Buy Plan by ${userData.firstName} ${userData.lastName}`,        //Change this to reflect your order title
                'quantity': 1,      //Quantity of the product
                'unit_price': amountAfterDiscount,       //Quantity * price must be equal to amount
                'products_per_title': `Subscription payment`,      //Change this to your products
                'return_url': process.env.return_url_plan,       //This should be your callback url
                'cc_first_name': userData.firstName?userData.firstName:"NA",        //Customer First Name
                'cc_last_name': userData.lastName?userData.lastName:"NA",      //Customer Last Name
                'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
                'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
                'billing_address': "NA",        //Billing Address
                'city': "NA",          //Billing City
                'state': "NA",        //Billing State
                'postal_code': "NA",     //Postal Code
                'country': iso3 ? iso3 : "IND",        //Iso 3 country code
                'email': userData.email,        //Customer Email
                'ip_customer': 'NA',        //Pass customer IP here
                'ip_merchant': 'NA',        //Change this to your server IP
                'address_shipping': "NA",      //Shipping Address
                'city_shipping': "NA",        //Shipping City
                'state_shipping': "NA",      //Shipping State
                'postal_code_shipping': "NA",
                'country_shipping': iso3 ? iso3 : "IND",
                'other_charges': 0,        //Other chargs can be here
                'reference_no': +new Date(),      //Pass the order id on your system for your reference
                'msg_lang': 'en',       //The language for the response
                'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
                'is_tokenization': "TRUE",
                'is_existing_customer': "FALSE",
                order_id: +new Date(),
                product_name: "NA",
                customer_email: userData.email,
                address_billing: "NA",
                state_billing: "NA",
                city_billing: "NA",
                postal_code_billing: "NA",
                country_billing: iso3 ? iso3 : "IND",
                billing_shipping_details: "NA",
            };
            let paymentResult = await PayTabManager.createPage(tokenizationData);

            if (paymentResult) {
                if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                    paymentUrl = paymentResult.payment_url;
                    pId = paymentResult.p_id;
                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                } else {
                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                }
            } else {
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
            }    
        }else{
            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED;
            transactionId = await UniversalFunctions.generateRandomOTP();
        }
        
        let transactionDataToSave = {
            vendor: userData._id,
            plan: payload.planId,
            transactionType: planData.type===APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE?APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES:APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
            tax: 0,
            amount: amountAfterDiscount,
            amountWithTax: amountAfterDiscount,
            deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            ...(pId && {pId: pId}),
            status: paymentStatus,
            ...(transactionId && {transactionId: transactionId}),
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);
        console.log("paymentUrl", paymentUrl, "planData.price", amountAfterDiscount)
        if (paymentUrl && planData.price>0) {
            return {paymentUrl}
        }
        else if(planData.price === 0){
            return {
                transactionId: transaction._id
            }
        }else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
        }
    } catch (e) {
        console.log("eeeeeeeeeeeeee", e)
        throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
    }
};

const verifyPaymentPlan = async (payload) => {
    try {
        console.log("payload", JSON.stringify(payload));
        let redirectTo;
        let data = {
            'payment_reference': payload.payment_reference
        };

        let paymentResult = await PayTabManager.verify(data);
        if (paymentResult.response_code === 100 || paymentResult.response_code === "100" || paymentResult.response_code === 4012 || paymentResult.response_code === "4012") {

            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: paymentResult.transaction_id,
                pt_customer_email: payload.pt_customer_email,
                pt_customer_password: await UniversalFunctions.encryptDecrypt(payload.pt_customer_password, 'encrypt'),
                pt_token: payload.pt_token
            };
            let [transaction] = await Promise.all([
                Dao.findAndUpdateWithPopulate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}, [{
                    path: 'plan',
                    select: 'type _id',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
                }]),
            ]);
            if (transaction.plan.type === APP_CONSTANTS.PLAN_TYPE.NORMAL) {
                redirectTo = `${process.env.vendorUrl}vendor/plans?transactionId=${transaction._id}&planId=${transaction.plan._id}`;
            } 
            else if (transaction.plan.type === APP_CONSTANTS.PLAN_TYPE.REDIRECTION_BUNDLE) {
                redirectTo = `${process.env.vendorUrl}vendor/plans?transactionId=${transaction._id}&planId=${transaction.plan._id}&bundle=true`;
            } 
            else {
                redirectTo = `${process.env.vendorUrl}vendor/advertisement-plans?transactionId=${transaction._id}&planId=${transaction.plan._id}`;
            }
        } else {
            redirectTo = `${process.env.vendorUrl}payment-error`;
            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
            };
            await Promise.all([
                Dao.findAndUpdate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}),
            ])
        }
        return redirectTo
    } catch (e) {
        throw e
    }
}

let getBase64 = async (payload) => {
    try {
        return await UploadManager.getBuffer(payload.url)
    } catch (e) {
        throw e
    }
};

let downgradeRequest = async (payload, userData)=>{
    try{
        payload.vendor = userData._id;
        await Dao.saveData(Models.planDowngradeRequests, payload)
        return {}
    }catch(e){
        throw e;
    }
}

module.exports = {
    listCategories: listCategories,
    listCollections: listCollections,
    listCommonServices: listCommonServices,
    listPlans: listPlans,
    addCategory: addCategory,
    selectPlan: selectPlan,
    getBase64: getBase64,
    makePaymentPlan: makePaymentPlan,
    verifyPaymentPlan: verifyPaymentPlan,
    downgradeRequest: downgradeRequest
};




