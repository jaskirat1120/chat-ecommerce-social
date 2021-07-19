// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const CommonHelper = require('../../helper-functions/helpers');
const TokenManager = require('../../../lib/token-manager');
const smsManager = require('../../../lib/twilio-manager');
const UniversalFunctions = require('../../../utils/universal-functions');
const HelperCommonFunction = require('../../helper-functions/common');
const AdminHelperFunction = require('../../helper-functions/admin');
const EmailHandler = require('../../email-helpers/emailHandler');
const CommonController = require('../common/controller');
const FeedController = require('../../user/feed/controller');
const validator = require("email-validator");
const moment = require('moment');
const mongoose = require('mongoose');
const Json2csvParser = require("json2csv").Parser;

const signUp = async (payload) => {
    try {
        let issuedAt = +new Date();
        let phoneCheck, emailCheck;

        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456";


        phoneCheck = await CommonHelper.checkUserPhone(payload, Models.vendors, APP_CONSTANTS.USER_TYPE.VENDOR_OWNER);

        if (phoneCheck.userExists) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST;
        }

        emailCheck = await CommonHelper.checkUserEmail(payload, Models.vendors, APP_CONSTANTS.USER_TYPE.VENDOR_OWNER);
        if (emailCheck && emailCheck.userExists) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST;
        }

        if (payload.vendorRegisterName) {
            let nameCheck = await Dao.findOne(Models.vendors, {vendorRegisterName: payload.vendorRegisterName}, {_id: 1}, {lean: true});
            if (nameCheck) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NAME_ALREADY_EXISTS;
            }
        }
        payload.OTP = otp;

        payload.OTPExpiry = +moment().add(5, 'minutes');  //otp Expires in 2 minute
        payload.issuedAt = issuedAt;  // For access Token expiry
        payload.verificationLink = issuedAt + (24 * 60 * (60000));
        let register = await registerUser(payload, phoneCheck);

        let templateData = {
            vendor: register._id,
            headerTextColor: APP_CONSTANTS.APP.HEADER_TEXT_COLOR,
            headerColor: APP_CONSTANTS.APP.HEADER_COLOR
        };

        let saveDefaultTemplate = await Dao.saveData(Models.vendorTemplate, templateData);

        await updateCategory(payload, register);

        let message = `Dear Vendor Owner, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
        await smsManager.sendMessage('+' + (register.phoneNumber.countryCode).toString() + (register.phoneNumber.phoneNo.toString()), message);
        await EmailHandler.sendEmailSignUp(payload, APP_CONSTANTS.USER_TYPE.VENDOR_OWNER);
        let tokenData = {
            _id: register._id,
            scope: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
            issuedAt: issuedAt
        };
        register.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.VENDOR);
        delete register.password;
        return register;
    } catch (err) {
        throw err;
    }
};

const registerUser = async (payloadData, check1) => {

    console.log("INSIDE REGISTER FUNCTION");

    try {
        let dataToUp = {
            name: payloadData.name ? payloadData.name : '',
            firstName: payloadData.firstName ? payloadData.firstName : '',
            lastName: payloadData.lastName ? payloadData.lastName : '',
            vendorRegisterName: payloadData.vendorRegisterName ? payloadData.vendorRegisterName : '',
            hashTag: `${payloadData.vendorRegisterName.toLowerCase().replace(/\s/g, '')}`,
            signUpBy: payloadData.signUpBy,
            profileStatus: APP_CONSTANTS.PROFILE_ENUM.ADDED,
            isAdminVerified: false,
            subscription: null,
            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            OTP: payloadData.OTP ? payloadData.OTP : '',
            issuedAt: payloadData.issuedAt,
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            language: payloadData.language,
            tradingAuthorized: payloadData.tradingAuthorized,
            webUrl: payloadData.webUrl,
            updatedDate: +new Date(),
            password: await UniversalFunctions.bCryptData(payloadData.password),
            ...(payloadData.lat && {lat: payloadData.lat}),
            ...(payloadData.long && {lat: payloadData.long}),
            ...(payloadData.lat && payloadData.long && {latLong: [payloadData.long, payloadData.lat]}),
            ...(payloadData.vendorPurpose && {vendorPurpose: payloadData.vendorPurpose}),
            ...(payloadData.vendorSize && {vendorSize: payloadData.vendorSize}),
            ...(payloadData.address && {address: payloadData.address}),
            ...(payloadData.country && {country: payloadData.country}),
            ...(payloadData.currency && {currency: payloadData.currency}),
            ...(payloadData.ownerId && {ownerId: payloadData.ownerId}),
            ...(payloadData.courierService && {courierService: payloadData.courierService}),
            ...(payloadData.coverageArea && {coverageArea: payloadData.coverageArea}),
            ...(payloadData.monthlySale && {monthlySale: payloadData.monthlySale}),
            ...(payloadData.ownerBio && {ownerBio: payloadData.ownerBio}),
            ...(payloadData.businessDescription && {businessDescription: payloadData.businessDescription}),
            ...(payloadData.bankDetails && {bankDetails: payloadData.bankDetails}),
            ...(payloadData.availabilityForTrade && {availabilityForTrade: payloadData.availabilityForTrade}),
            ...(payloadData.license && {license: payloadData.license}),
            ...(payloadData.passportCopy && {passportCopy: payloadData.passportCopy}),
            ...(payloadData.selfieWithPassport && {selfieWithPassport: payloadData.selfieWithPassport}),
            ...(payloadData.webExternalUrl && {webExternalUrl: payloadData.webExternalUrl})
        };


        let checkHash = await checkCreateHashTag(dataToUp.hashTag);
        dataToUp.hashTag = checkHash.hashTag

        if (payloadData.deviceToken) {
            dataToUp.deviceToken = payloadData.deviceToken;
            await Dao.updateMany(Models.vendors, {deviceToken: payloadData.deviceToken}, {deviceToken: ''}, {new: true});
        }

        if (payloadData.email) {
            let check = await CommonHelper.checkUserEmail(payloadData, Models.vendors, APP_CONSTANTS.USER_TYPE.VENDOR_OWNER);
            if (check.userExists) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST;
            }
            dataToUp.email = payloadData.email;
        }

        if (validator.validate(payloadData.email)) {
            dataToUp.email = payloadData.email;
            dataToUp.verificationLink = payloadData.verificationLink;
        }
        if (payloadData.countryCode && payloadData.phoneNumber) {
            if (payloadData.phoneNumber.length > 18) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_VALIDATION;
            let countryCode = payloadData.countryCode;
            let phoneNumber = payloadData.phoneNumber;
            dataToUp.phoneNumber = {
                countryCode: countryCode.toString(),
                phoneNo: phoneNumber.toString(),
                ISO: payloadData.ISO ? payloadData.ISO : ''
            };
        }
        let dataToReturn;
        dataToUp.createdDate = +new Date();
        dataToUp.updatedDate = +new Date();
        dataToReturn = await Dao.saveData(Models.vendors, dataToUp);
        delete dataToReturn.__v;
        delete dataToReturn.password;

        console.log("dataToReturn", dataToReturn)

        return dataToReturn

    } catch (e) {
        console.log("eeeeeeeeeeee  ", e);
        throw e;
    }
};

const checkCreateHashTag = async (hashTag) => {
    try {
        let hash = hashTag
        console.log("hashhash", hash)
        let countHash = await Dao.countDocuments(Models.vendors, {hashTag: hashTag});
        console.log("countHash", countHash)
        if (countHash && countHash > 0) {
            hash = `${hashTag}${countHash}`
            return await checkCreateHashTag(hash)
        } else {
            console.log({hashTag: hash})
            return {hashTag: hash}
        }
    } catch (e) {
        throw e
    }
}

const logIn = async (payload) => {
    try {
        let check1;
        let issuedAt = +new Date();
        payload.issuedAt = issuedAt;
        check1 = await verifyUser(payload, {$in: [APP_CONSTANTS.USER_TYPE.VENDOR_OWNER, APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT]});
        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = '123456';
        let dataToUpdate = {
            issuedAt: issuedAt,
            lastLogin: +new Date(),
            language: payload.language,
            isVerified: false,
            OTP: otp,
            OTPExpiry: +moment().add(5, 'minutes'),
            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
        };
        if (payload.deviceToken) {
            dataToUpdate.deviceToken = payload.deviceToken;
            await Dao.updateMany(Models.vendors, {deviceToken: payload.deviceToken}, {deviceToken: ''}, {new: true});
        }

        // let otp = "123456";
        // dataToUpdate.OTP = otp;
        // check1.OTP = otp;
        // let message='Your one time Password is- ' +otp;
        // await TwilioManager.sendMessage('+'+(check1.phoneNumber.countryCode).toString()+(check1.phoneNumber.phoneNo.toString()),message)

        let message = `Dear Vendor Owner, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
        await smsManager.sendMessage('+' + (check1.phoneNumber.countryCode).toString() + (check1.phoneNumber.phoneNo.toString()), message);

        await Dao.findAndUpdate(Models.vendors, {_id: check1._id}, dataToUpdate, {lean: true});
        check1.isVerified = false;
        return check1;

    } catch (err) {
        throw err;
    }
};


let getProfile = async (userData, payload) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            _id: userData._id
        };

        let aggregateArray = [
            {$match: criteria},
            {
                $lookup: {
                    from: "vendorcategories",
                    localField: "_id",
                    foreignField: "vendor",
                    as: "vendorCategories"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "vendorCategories.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "vendorCategories.subCategory",
                    foreignField: "_id",
                    as: "subCategory"
                }
            },
            {
                $lookup: {
                    from: 'vendortemplates',
                    localField: '_id',
                    foreignField: 'vendor',
                    as: 'vendorTemplate'
                }
            },
            {
                $unwind: {
                    path: '$vendorTemplate',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    vendorCategories: 0
                }
            },
            {
                $lookup: {
                    "from": "vendors",
                    "let": {"parent": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    $and: [
                                        {$eq: ['$parentId', '$$parent']},
                                        {$eq: ['$userType', APP_CONSTANTS.USER_TYPE.VENDOR_MEMBER]},
                                        {$ne: ['$status', APP_CONSTANTS.STATUS_ENUM.DELETED]},
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "members"
                }
            }
        ];

        let populate = [
            {
                path: 'coverageArea',
                select: 'name'
            },
            {
                path: 'courierService',
                select: 'name'
            },
            {
                path: 'vendorSize',
                select: 'name'
            },
            {
                path: 'country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'bankDetails.country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
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
            },
            {
                path: 'vendorTemplate.template',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.TEMPLATE_CATEGORIES
            }];

        let UserData = await Dao.aggregateDataWithPopulate(Models.vendors, aggregateArray, populate);

        if (UserData[0] && UserData[0]._id) {
            delete UserData[0].password;
            delete UserData[0].__v;
            UserData[0].avgRating = UserData[0].rating / UserData[0].noOfRating || 0;
            let bankCount = await Dao.countDocuments(Models.vendorBanks, {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                vendor: UserData[0]._id
            })
            UserData[0].bankCount = bankCount
            let unReadNotifications = await Dao.countDocuments(Models.notifications, {
                receiver: userData._id,
                status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD
            })
            UserData[0].unReadNotifications = unReadNotifications;
            return UserData[0];
        }

    } catch (e) {
        throw e;
    }
};


const verifyUser = async (payloadData, type) => {
    return new Promise(async (resolve, reject) => {

        let criteria = {
            userType: type
        };

        if (payloadData.email) {
            criteria.email = new RegExp("^" + payloadData.email + "$", "i");
        }
        if (payloadData.phoneNumber && payloadData.countryCode) {
            let countryCode = payloadData.countryCode;
            let phoneNumber = payloadData.phoneNumber;
            criteria = {
                'phoneNumber.countryCode': countryCode.toString(),
                'phoneNumber.phoneNo': phoneNumber.toString(),
                userType: type
            }
        }

        let populate = [
            {
                path: 'coverageArea',
                select: 'name'
            },
            {
                path: 'courierService',
                select: 'name'
            },
            {
                path: 'bankDetails.country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'country',
                select: 'name inCoverageArea'
            },
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
            }];

        let userData = await Dao.populateData(Models.vendors, criteria, {}, {lean: true}, populate);

        userData = userData[0] ? userData[0] : null;
        if (!!userData && userData._id) {
            if (userData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
            }
            if (!userData.password || (userData.password && !(await UniversalFunctions.compareCryptData(payloadData.password, userData.password))))
                reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_PASSWORD);
            else {
                let tokenData = {
                    _id: userData._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
                    issuedAt: payloadData.issuedAt,
                    superAdmin: userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT ? false : true,
                    permissions: userData.permissions ? userData.permissions : ""
                };

                userData.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.VENDOR);
                delete userData.password;
                resolve(userData);
            }
        } else {
            reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_PHONE);
        }
    });
};


const addOrEditProfile = async (payload, userData) => {
    try {
        let criteria = {
            _id: userData._id
        };
        payload.profileStatus = APP_CONSTANTS.PROFILE_ENUM.ADDED;

        if (payload.email && payload.email !== '') {
            let data = await Dao.findOne(Models.vendors, {
                email: payload.email,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                _id: {$ne: userData._id}
            }, {_id: 1}, {lean: true});
            if (data) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST;
            }
        }
        if (payload.phoneNumber && payload.phoneNumber !== '') {
            if (payload.phoneNumber.length > 18) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_VALIDATION;
            }
            let countryCode = payload.countryCode;
            let phoneNumber = payload.phoneNumber;
            payload.phoneNumber = {
                countryCode: countryCode.toString(),
                phoneNo: phoneNumber.toString(),
                ISO: payload.ISO
            };
            let criteria = {
                'phoneNumber.countryCode': countryCode.toString(),
                'phoneNumber.phoneNo': phoneNumber.toString(),
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                _id: {$ne: userData._id}
            };
            let data = await Dao.findOne(Models.vendors, criteria, {_id: 1}, {lean: true});
            if (data) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST;
            }
        }
        if (payload.phoneNumber === '') {
            payload.phoneNumber = {};
        }

        console.log("payloadpayload", JSON.stringify(payload));

        let populate = [{
            path: 'country',
            select: 'name inCoverageArea'
        }]

        let dataUpdated = await Dao.findAndUpdateWithPopulate(Models.vendors, criteria, payload, {
            lean: true,
            new: true
        }, populate);

        await updateCategory(payload, userData);

        // let selectedCategories = await Dao.findOne(Models.vendorCategories, {vendor: userData._id}, {_id: 1}, {lean: true});
        // if (selectedCategories) {
        //     await Dao.findAndUpdate(Models.vendorCategories, {vendor: userData._id}, {
        //         category: payload.category,
        //         subCategory: payload.subCategory
        //     }, {new: true});
        // } else {
        //     await Dao.saveData(Models.vendorCategories, {
        //         category: payload.category,
        //         subCategory: payload.subCategory,
        //         vendor: userData._id
        //     });
        // }

        console.log("dataUpdated", dataUpdated);

        let dataToSend = await getProfile(userData);
        return dataToSend;
    } catch (err) {
        throw err;
    }
};


let updateCategory = async (payload, userData) => {
    try {
        // if(payload && payload.vendorId){
        //     userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        // }
        let selectedCategories = await Dao.findOne(Models.vendorCategories, {vendor: userData._id}, {_id: 1}, {lean: true});
        if (selectedCategories) {
            await Dao.findAndUpdate(Models.vendorCategories, {vendor: userData._id}, {
                category: payload.category,
                subCategory: payload.subCategory
            }, {new: true});
        } else {
            await Dao.saveData(Models.vendorCategories, {
                category: payload.category,
                subCategory: payload.subCategory,
                vendor: userData._id
            });
        }
    } catch (e) {
        throw e
    }
};

const logout = async (userData) => {
    try {
        let criteria = {
                _id: userData._id
            },
            dataToUp = {
                deviceToken: '',
                issuedAt: 0
            };
        await Dao.findAndUpdate(Models.vendors, criteria, dataToUp, {lean: true, new: true});
        return {};
    } catch (err) {
        throw err;
    }
};


const changePassword = async (payload, userData) => {
    try {
        return await HelperCommonFunction.changePassword(payload, userData, Models.vendors);
    } catch (err) {
        throw err;
    }
};


let verifyAccount = async (payload, userData) => {
    try {
        let criteria = {
            'phoneNumber.countryCode': payload.countryCode.toString(),
            'phoneNumber.phoneNo': payload.phoneNumber.toString(),
        };
        let get = await Dao.getData(Models.vendors, criteria, {isVerified: 1, OTP: 1, OTPExpiry: 1, permissions: 1, userType: 1}, {lean: true});
        if (get.length) {
            if (/*payload.OTP !== '123456' && */ get[0].OTP !== payload.OTP) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            }
            else if(get[0].OTPExpiry < +new Date()) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            }
            else{
                let issuedAt = +new Date();
                let dataToUpdate = {isVerified: true, OTP: '', issuedAt: issuedAt};
                let tokenData = {
                    _id: get[0]._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.VENDOR,
                    issuedAt: issuedAt,
                    superAdmin: get[0].userType === APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT ? false : true,
                    permissions: get[0].permissions ? get[0].permissions : ""
                };

                let updatedData = await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
                updatedData.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.VENDOR);
                delete updatedData.password;
                return updatedData;
            }
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};

let resendOTP = async (payload) => {
    let criteria = {};
    criteria = {
        'phoneNumber.countryCode': payload.countryCode.toString(),
        'phoneNumber.phoneNo': payload.phoneNumber.toString(),
        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER
    };
    let data = await Dao.findOne(Models.vendors, criteria, {}, {lean: true});
    if (data) {
        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456";
        let dataToUpdate = {
            OTP: otp
        };
        let message = `Dear Vendor Owner, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`
        await smsManager.sendMessage('+' + data.phoneNumber.countryCode.toString() + data.phoneNumber.phoneNo.toString(), message)
        //
        await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {lean: true, new: true});
        return {
        };
    } else {
        throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_REGISTERED;
    }
};

let uploadFile = async (payload, userData) => {
    try {
        console.log("payload.file", payload.file);
        if (payload.file && payload.file.hapi.filename) {
            let url = await HelperCommonFunction.fileUpload(payload.file, "FILE");
            url.type = payload.type;
            //
            return url;
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_FILE;
        }
    } catch (err) {
        throw err;
    }
};


let settings = async () => {
    let promises = [
        Dao.findOne(Models.settings, {}, {}, {lean: true}),
        Dao.findOne(Models.appVersions, {appType: APP_CONSTANTS.USER_TYPE.USER}, {}, {lean: true}),
        Dao.findOne(Models.appDefaults, {}, {
            termsAndCondition: 1,
            aboutUs: 1,
            contactAdmin: 1,
            emailAdmin: 1,
            privacyPolicy: 1
        }, {lean: true})
    ];

    let [settings, appVersions, appDefaults] = await Promise.all(promises);

    return {settings, appVersions, appDefaults}
};


let forgotPassword = async (payload) => {
    try {
        let criteria = {}, dataToUpdate = {};
        if (validator.validate(payload.email)) {
            criteria.email = payload.email;
            let getData = await Dao.findOne(Models.vendors, criteria, {}, {lean: true});
            if (getData) {
                if (getData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
                // else if (getData.isVerified === false) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.VERIFY_ACCOUNT_FORGOT);
                else {
                    let otp = await UniversalFunctions.generateRandomOTP();
                    // let otp = "123456";
                    // dataToUpdate.resetPasswordExpiry = +moment().add(24, 'hours');
                    dataToUpdate.resetPasswordExpiry = otp;
                    let url = `${process.env.RESET_PASSWORD_VENDOR}/${getData._id}/${dataToUpdate.resetPasswordExpiry}`;
                    await EmailHandler.sendEmailForgotPassword(getData, url, otp);
                    await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {lean: true, new: true});
                    return {}
                }
            } else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_REGISTERED
            }
        }
    } catch (e) {
        console.log(e);
        throw e
    }
};

let resetPassword = async (payload) => {
    try {
        return await AdminHelperFunction.resetPassword(payload, Models.vendors);
    } catch (e) {
        console.log(e);
        throw e
    }
};

const selectTemplate = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        console.log("userDatauserData", userData)
        let findTemplate = await Dao.findOne(Models.vendorTemplate, {vendor: userData._id}, {_id: 1}, {lean: true});
        // if (payload.vendorRegisterName) {
        //     let nameCheck = await Dao.findOne(Models.vendors, {
        //         vendorRegisterName: payload.vendorRegisterName,
        //         ...(userData.parentId && {parentId: userData.parentId}),
        //         status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
        //         _id: {$ne: userData._id}
        //     }, {_id: 1}, {lean: true});
        //     if (nameCheck) {
        //         throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NAME_ALREADY_EXISTS;
        //     }
        // }
        let dataToUpdate = {
            ...(payload.banner && {banner: payload.banner}),
            ...(payload.ownerPicture && {ownerPicture: payload.ownerPicture}),
            ...(payload.name && {name: payload.name}),
            ...(payload.firstName && {firstName: payload.firstName}),
            ...(payload.lastName && {lastName: payload.lastName}),
            ...(payload.vendorRegisterName && {vendorRegisterName: payload.vendorRegisterName}),
            ...(payload.country && {country: payload.country}),
            ...(payload.currency && {currency: payload.currency}),
            ...(payload.ownerBio && {ownerBio: payload.ownerBio}),
            ...(payload.businessDescription && {businessDescription: payload.businessDescription}),
            ...(payload.lat && {lat: payload.lat}),
            ...(payload.long && {long: payload.long}),
            ...(payload.address && {address: payload.address}),
        };
        if (payload.lat && payload.long) {
            dataToUpdate.latLong = [payload.long, payload.lat]
        }
        await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, dataToUpdate, {
            lean: true,
            new: true
        });
        if (findTemplate) {
            await Dao.findAndUpdate(Models.vendorTemplate, {_id: findTemplate._id}, payload, {
                lean: true,
                new: true
            });
            return await getProfile(userData)
        } else {
            payload.vendor = userData._id;
            await Dao.saveData(Models.vendorTemplate, payload);
            return await getProfile(userData)
        }
    } catch (e) {
        throw e
    }
};

const secondStep = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        if (payload.collections) {
            if (payload.collections.length) {
                for (let key of payload.collections) {
                    key.addedByVendor = userData._id;
                    if (!key.parentId) key.parentId = null;
                    if (key._id && key._id !== '') {
                        let query = {
                            _id: key._id
                        };
                        delete key._id;
                        await Dao.findAndUpdate(Models.categories, query, key, {})
                    } else {
                        delete key._id;
                        let collection = await Dao.saveData(Models.categories, key);
                        let dataToSaveFeed = {
                            vendor: userData._id,
                            collectionId: collection._id,
                            privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC
                        };
                        await Dao.saveData(Models.feeds, dataToSaveFeed);

                        let notificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ADDED_COLLECTION, {
                            vendorName: `${userData.firstName} ${userData.lastName}`
                        });
                        let dataToSaveNotification = {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADDED_COLLECTION,
                            message: notificationMessage,
                            vendor: userData._id,
                            collectionId: collection._id,
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADDED_COLLECTION
                        };
                        await Dao.saveData(Models.notifications, dataToSaveNotification)
                    }
                }
            }
        }

        if (payload.deletedCollections && payload.deletedCollections.length) {
            await Dao.updateMany(Models.categories, {_id: {$in: payload.deletedCollections}}, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {multi: true})
        }

        let findTemplate = await Dao.findOne(Models.vendorTemplate, {vendor: userData._id}, {_id: 1}, {lean: true});
        if (findTemplate) {
            if (payload.headerBackground === "") {
                payload.$unset = {
                    headerBackground: 1
                };
                delete payload.headerBackground;
            }

            await Dao.findAndUpdate(Models.vendorTemplate, {_id: findTemplate._id}, payload, {
                lean: true,
                new: true
            });
        } else {
            payload.vendor = userData._id;
            await Dao.saveData(Models.vendorTemplate, payload)
        }
        // return await getProfile(userData)
        return await CommonController.listCollections({}, userData)
    } catch (e) {
        throw e
    }
};


const thirdStep = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        if (payload.products.length) {
            await Dao.updateMany(Models.products, {_id: {$in: payload.products}}, {collectionId: payload.collectionId}, {lean: true})
        }
        payload.vendor = userData._id;
        let criteria = {
            vendor: userData._id,
            collectionId: payload.collectionId
        };
        let checkCollection = await Dao.findOne(Models.collectionProducts, criteria, {}, {lean: true});
        if (checkCollection) {
            await Dao.findAndUpdate(Models.collectionProducts, {_id: checkCollection._id}, payload, {})
        } else
            await Dao.saveData(Models.collectionProducts, payload);
        return await getProfile(userData)
    } catch (e) {
        throw e
    }
};
const fourthStep = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, payload, {});
        if (payload.members && payload.members.length) {
            for (let key of payload.members) {
                if (key._id) {
                    await Dao.findAndUpdate(Models.vendors, {_id: key._id}, key, {})
                } else {
                    delete key._id;
                    key.userType = APP_CONSTANTS.USER_TYPE.VENDOR_MEMBER;
                    key.parentId = userData._id;
                    key.password = await UniversalFunctions.bCryptData('123456');
                    await Dao.saveData(Models.vendors, key)
                }
            }
        }
        if (payload.deletedMembers) {
            await Dao.updateMany(Models.vendors, {_id: {$ne: payload.deletedMembers}}, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {multi: true})
        }
        return await getProfile(userData)
    } catch (e) {
        throw e
    }
};
const fifthStep = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, payload, {});
        return await getProfile(userData)
    } catch (e) {
        throw e
    }
};

const deviceTokenUpdate = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        return await HelperCommonFunction.updateDeviceToken(payload, userData);
    } catch (e) {
        throw e;
    }
};

const analytics = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    orderId: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: 1
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                count: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        };
        let endDateTime1, startDateTime1, object = {};
        if (payload.endDate) {
            endDateTime1 = +moment(payload.endDate).endOf('day')._d;
            object.$lte = endDateTime1
        }
        if (payload.startDate) {
            startDateTime1 = +moment(payload.startDate).startOf('day')._d;
            object.$gte = startDateTime1
        }


        let groupType = {};
        if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            groupType = {
                $group: {
                    _id: {
                        month: "$_id.month",
                    },
                    count: {
                        $sum: "$count"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };

        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            groupType = {
                $group: {
                    _id: {
                        year: "$_id.year",
                    },
                    count: {
                        $sum: "$count"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };
        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            groupType = {
                $group: {
                    _id: {
                        day: "$_id.day",
                    },
                    count: {
                        $sum: "$count"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };
        } else {
            groupType = {
                $group: {
                    _id: {
                        date: "$_id.date",
                    },
                    count: {
                        $sum: "$count"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            }
        }

        let data = {
            object,
            endSort,
            endProject,
            dateGroup,
            dateProject,
            groupType
        };
        if (payload.type === APP_CONSTANTS.ANALYTICS_TYPE.ORDERS)
            return await orderAnalytics(payload, userData, data);

        if (payload.type === APP_CONSTANTS.ANALYTICS_TYPE.DASHBOARD)
            return await orderAnalytics(payload, userData, data);

        if (payload.type === APP_CONSTANTS.ANALYTICS_TYPE.DASHBOARD_PRODUCT)
            return await productAnalyticsDashboard(payload, userData, data);

        if (payload.type === APP_CONSTANTS.ANALYTICS_TYPE.PRODUCTS)
            return await productAnalytics(payload, userData, data)
    } catch (e) {
        throw e
    }
};

let productAnalytics = async (payload, userData, data) => {
    // if(payload && payload.vendorId){
    //     userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
    // }
    let criteria = {
        ...(data.object && {createdDate: data.object}),
        vendor: mongoose.Types.ObjectId(userData._id)
    };
    if (payload.startDate && payload.endDate) {
        criteria.createdDate = data.object
    }
    let aggregateArray = [
        {
            $match: criteria
        },
        data.dateProject,
        data.dateGroup
    ];
    aggregateArray.push(data.groupType, data.endProject, data.endSort);

    console.log(JSON.stringify(aggregateArray))

    let totalProducts = await Dao.aggregateData(Models.products, aggregateArray);

    aggregateArray[0].$match = {
        ...(data.object && {createdDate: data.object}),
        status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
        availableForSale: true,
        vendor: mongoose.Types.ObjectId(userData._id)
    };
    if (payload.startDate && payload.endDate) {
        aggregateArray[0].$match.createdDate = data.object
    }
    let activeProducts = await Dao.aggregateData(Models.products, aggregateArray);

    aggregateArray[0].$match = {
        ...(data.object && {createdDate: data.object}),
        status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
        availableForSale: false,
        vendor: mongoose.Types.ObjectId(userData._id)
    };
    if (payload.startDate && payload.endDate) {
        aggregateArray[0].$match.createdDate = data.object
    }
    let soldOutProducts = await Dao.aggregateData(Models.products, aggregateArray);

    return {
        totalProducts, activeProducts, soldOutProducts
    }
};

let productAnalyticsDashboard = async (payload, userData, data) => {
    // if(payload && payload.vendorId){
    //     userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
    // }
    let criteria = {
        status: {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]},
        vendor: mongoose.Types.ObjectId(userData._id)
    };

    // if(data.object && data.object!=={} && payload.startDate && payload.endDate){
    //     criteria.createdDate = data.object
    // }
    if (payload.startDate && payload.endDate) {
        criteria.createdDate = data.object
    }
    let totalProducts = await Dao.countDocuments(Models.products, criteria);

    criteria = {
        status: {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]},
        availableForSale: true,
        vendor: mongoose.Types.ObjectId(userData._id)
    };
    if (payload.startDate && payload.endDate) {
        criteria.createdDate = data.object
    }
    let activeProducts = await Dao.countDocuments(Models.products, criteria);

    criteria = {
        status: {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]},
        availableForSale: false,
        vendor: mongoose.Types.ObjectId(userData._id)
    };
    if (payload.startDate && payload.endDate) {
        criteria.createdDate = data.object
    }
    let soldOutProducts = await Dao.countDocuments(Models.products, criteria);

    return {
        totalProducts, activeProducts, soldOutProducts
    }
};

const orderAnalytics = async (payload, userData, data) => {
    try {
        // if(payload && payload.vendorId){
        //     userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        // }
        console.log(data.object);
        if (data.object) {
            console.log("trueeeeeeeeeeeeeeee")
        }

        let criteria = {
            ...(payload.status && {status: payload.status}),
            vendor: mongoose.Types.ObjectId(userData._id)
        };

        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        // data.dateGroup.$group._id.orderId = "$orderId"
        // data.dateGroup.$group.data = {
        //     $addToSet: "$orderId"
        // }
        let aggregateArray = [
            {
                $match: criteria
            },
            // {
            //     $group: {
            //         _id: "$orderId",
            //         count: {
            //             $sum: 1
            //         }
            //     }
            // },
            {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            }
        ];

        // aggregateArray.push(data.groupType, data.endProject, data.endSort)

        let totalOrder = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED, APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;

        let dispatchedOrders = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;
        let packedOrders = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;
        let inProcessOrders = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;
        let receivedOrders = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;
        let returnOrders = await Dao.aggregateData(Models.orders, aggregateArray);


        criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                    APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED]
            }
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = data.object
        }
        aggregateArray[0].$match = criteria;
        let closedOrders = await Dao.aggregateData(Models.orders, aggregateArray);
        if (payload.type && payload.type === APP_CONSTANTS.ANALYTICS_TYPE.DASHBOARD) {
            return {
                // totalOrder,
                closedOrders: closedOrders[0] ? (parseInt(closedOrders[0].count)) : 0,
                returnOrders: returnOrders[0] ? (parseInt(returnOrders[0].count)) : 0,
                receivedOrders: receivedOrders[0] ? (parseInt(receivedOrders[0].count)) : 0,
                inProcessOrders: inProcessOrders[0] ? (parseInt(inProcessOrders[0].count)) : 0,
                packedOrders: packedOrders[0] ? (parseInt(packedOrders[0].count)) : 0,
                dispatchedOrders: dispatchedOrders[0] ? (parseInt(dispatchedOrders[0].count)) : 0
            }
        } else {
            return {
                // totalOrder,
                closedOrders: closedOrders[0] ? ((parseInt(closedOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0,
                returnOrders: returnOrders[0] ? ((parseInt(returnOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0,
                receivedOrders: receivedOrders[0] ? ((parseInt(receivedOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0,
                inProcessOrders: inProcessOrders[0] ? ((parseInt(inProcessOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0,
                packedOrders: packedOrders[0] ? ((parseInt(packedOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0,
                dispatchedOrders: dispatchedOrders[0] ? ((parseInt(dispatchedOrders[0].count) / parseInt(totalOrder[0].count)) * 100).toFixed(2) : 0
            }
        }

    } catch (e) {
        throw e
    }
};


const checkVendor = async (payload) => {
    try {
        let criteria = {
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            $or: [
                {
                    'phoneNumber.countryCode': payload.countryCode,
                    'phoneNumber.phoneNo': payload.phoneNumber,
                },
                {
                    vendorRegisterName: new RegExp("^" + payload.vendorRegisterName + "$", "i")
                }]
        };
        let emailCriteria = {
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            email: new RegExp("^" + payload.email + "$", "i")
        };
        let dataEmail = await Dao.findOne(Models.vendors, emailCriteria, {
            _id: 1,
            email: 1,
            vendorRegisterName: 1,
            phoneNumber: 1
        }, {lean: true});
        let data = await Dao.findOne(Models.vendors, criteria, {
            _id: 1,
            email: 1,
            vendorRegisterName: 1,
            phoneNumber: 1
        }, {lean: true});
        console.log("data", data)
        let userExists = false;
        if (data) {
            if (payload.countryCode && payload.phoneNumber) {
                if (payload.countryCode === data.phoneNumber.countryCode && payload.phoneNumber === data.phoneNumber.phoneNo)
                    throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST
            }
            if (payload.vendorRegisterName) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NAME_ALREADY_EXISTS
            }
        }
        if (dataEmail) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST
        }
        return {userExists}
    } catch (e) {
        throw e
    }
};

const contactUsIssue = async (payload, userData) => {
    try {
        payload.reportBy = userData ? userData._id : null;
        payload.reportByModel = userData ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : "";
        return await Dao.saveData(Models.commonReports, payload)
    } catch {
        throw e;
    }
}

const soldProducts = async (userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED
                    ]
                },
                vendor: mongoose.Types.ObjectId(userData._id)
            },
            pipeline = [
                {
                    $match: criteria
                },
                {
                    $group: {
                        _id: null,
                        soldProductCount: {
                            $sum: "$products.quantity"
                        }
                    }
                }];

        let count = await Dao.aggregateData(Models.orders, pipeline);
        console.log("sold product count", JSON.stringify(count))
        if (count[0].soldProductCount) {
            return {
                soldProductCount: count[0].soldProductCount
            }
        } else {
            return {
                soldProductCount: 0
            }
        }
    } catch {

    }
}

const addBank = async (payload, userData) => {
    try {
        payload.vendor = userData._id;
        if (payload.default) {
            await Dao.updateMany(Models.vendorBanks, {vendor: userData._id}, {default: false}, {multi: true});
        }
        payload.iBanNumber = await UniversalFunctions.encryptDecrypt(payload.iBanNumber, 'encrypt')
        payload.swiftCode = await UniversalFunctions.encryptDecrypt(payload.swiftCode, 'encrypt')
        payload.accountNumber = await UniversalFunctions.encryptDecrypt(payload.accountNumber, 'encrypt')
        let dataToSave = await Dao.saveData(Models.vendorBanks, payload)
        dataToSave.iBanNumber = await UniversalFunctions.encryptDecrypt(dataToSave.iBanNumber, 'decrypt')
        dataToSave.swiftCode = await UniversalFunctions.encryptDecrypt(dataToSave.swiftCode, 'decrypt')
        dataToSave.accountNumber = await UniversalFunctions.encryptDecrypt(dataToSave.accountNumber, 'decrypt')
        return dataToSave
    } catch {
        throw e;
    }
}

const editBank = async (payload, userData) => {
    try {
        payload.updatedDate = +new Date();
        if (payload.default) {
            await Dao.updateMany(Models.vendorBanks, {vendor: userData._id}, {default: false}, {multi: true});
        }
        payload.iBanNumber = await UniversalFunctions.encryptDecrypt(payload.iBanNumber, 'encrypt')
        payload.swiftCode = await UniversalFunctions.encryptDecrypt(payload.swiftCode, 'encrypt')
        payload.accountNumber = await UniversalFunctions.encryptDecrypt(payload.accountNumber, 'encrypt')
        let dataToSave = await Dao.findAndUpdate(Models.vendorBanks, {_id: payload._id}, payload, {
            lean: true,
            new: true
        });
        dataToSave.iBanNumber = await UniversalFunctions.encryptDecrypt(dataToSave.iBanNumber, 'decrypt')
        dataToSave.swiftCode = await UniversalFunctions.encryptDecrypt(dataToSave.swiftCode, 'decrypt')
        dataToSave.accountNumber = await UniversalFunctions.encryptDecrypt(dataToSave.accountNumber, 'decrypt')
        return dataToSave
    } catch {
        throw e
    }
}


const addOrEditBank = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        if (payload._id) {
            return await editBank(payload, userData)
        } else {
            return await addBank(payload, userData)
        }
    } catch {
        throw e
    }
}

const listBanks = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            vendor: userData._id
        };
        let option = {
            lean: true,
            sort: {_id: -1},
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
        };
        let [data, count] = await Promise.all([
            Dao.getData(Models.vendorBanks, criteria, {}, option),
            Dao.countDocuments(Models.vendorBanks, criteria)
        ])
        if (data.length) {
            for (let key of data) {
                if (key.iBanNumber) key.iBanNumber = await UniversalFunctions.encryptDecrypt(key.iBanNumber, 'decrypt')
                if (key.swiftCode) key.swiftCode = await UniversalFunctions.encryptDecrypt(key.swiftCode, 'decrypt')
                if (key.accountNumber) key.accountNumber = await UniversalFunctions.encryptDecrypt(key.accountNumber, 'decrypt')
            }
        }
        return {data, count}
    } catch {
        throw e
    }
}


const deleteBank = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            _id: payload.bankId
        };
        let dataToUpdate = {
            status: APP_CONSTANTS.STATUS_ENUM.DELETED
        };
        return await Dao.findAndUpdate(Models.vendorBanks, criteria, dataToUpdate, {lean: true})
    } catch {
        throw e
    }
}

const setAsDefaultBank = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        if (payload.default) {
            await Dao.updateMany(Models.vendorBanks, {vendor: userData._id}, {default: false}, {multi: true});
        }
        return await Dao.findAndUpdate(Models.vendorBanks, {_id: payload.bankId}, {default: true}, {
            lean: true,
            new: true
        })
    } catch {
        throw e
    }
}

const dashboard = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let endDateTime1, startDateTime1, object = {};
        if (payload.endDate) {
            endDateTime1 = +moment(payload.endDate).endOf('day')._d;
            object.$lte = endDateTime1
        }
        if (payload.startDate) {
            startDateTime1 = +moment(payload.startDate).startOf('day')._d;
            object.$gte = startDateTime1
        }

        let salesPipeline = [{
            $match: {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                ...(payload.startDate && {createdDate: object})
            }
        },
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'transaction'
                }
            },
            {
                $unwind: {
                    path: '$transaction',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "transaction.transactionType": APP_CONSTANTS.TRANSACTION_TYPES.ORDER
                }
            },
            {
                $project: {
                    productPrice: "$transaction.amountWithTax",
                    quantity: "$transaction.quantity"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSale: {
                        $sum: "$productPrice"
                    },
                    totalQuantity: {
                        $sum: "$quantity"
                    },
                    totalClosedOrder: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    totalSale: 1,
                    totalClosedOrder: 1,
                    averageSale: {
                        $cond: {
                            if: {$eq: [0, "$totalQuantity"]},
                            then: 0,
                            else: {
                                $divide: ["$totalSale", "$totalQuantity"]
                            }
                        }
                    },
                }
            }
        ]
        let salesRelatedData = await Dao.aggregateData(Models.orders, salesPipeline)

        let totalDiscountPipeline = [{
            $match: {
                vendor: mongoose.Types.ObjectId(userData._id),
                ...(payload.startDate && {createdDate: object})
            }
        },
            {
                $lookup: {
                    from: 'productvariants',
                    let: {
                        productId: "$_id",
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$product", "$$productId"],
                                    },
                                    {
                                        $eq: ["$status", APP_CONSTANTS.STATUS_ENUM.ACTIVE]
                                    }
                                ]
                            }
                        }
                    }, {
                        $project: {
                            discount: 1,
                            quantityAvailable: 1,
                            profit: 1,
                            price: 1
                        }
                    }],
                    as: 'productVariants'
                }
            },
            {
                $unwind: {
                    path: '$productVariants',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: "$_id",
                    variantsAvailable: "$variantsAvailable",
                    price: {
                        $cond: {
                            if: {$eq: ['$variantsAvailable', true]},
                            then: "$productVariants.price",
                            else: "$price"
                        }
                    },
                    discount: {
                        $cond: {
                            if: {$eq: ['$variantsAvailable', true]},
                            then: "$productVariants.discount",
                            else: "$discount"
                        }
                    },
                    quantityAvailable: {
                        $cond: {
                            if: {$eq: ['$variantsAvailable', true]},
                            then: "$productVariants.quantityAvailable",
                            else: "$quantityAvailable"
                        }
                    },
                    profit: {
                        $cond: {
                            if: {$eq: ['$variantsAvailable', true]},
                            then: "$productVariants.profit",
                            else: "$profit"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    variantsAvailable: "$variantsAvailable",
                    price: 1,
                    discount: {
                        $divide: [{$multiply: ["$price", "$discount"]}, 100]
                    },
                    quantityAvailable: 1,
                    profit: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalDiscountGiven: {
                        $sum: "$discount",
                    },
                    totalQuantityAvailable: {
                        $sum: "$quantityAvailable"
                    },
                    totalProfit: {
                        $sum: "$profit"
                    }
                }
            }
        ]

        let productRelatedData = await Dao.aggregateData(Models.products, totalDiscountPipeline)

        let totalFollowedPipeline = {
            receiver: userData._id,
            status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
            ...(payload.startDate && {createdDate: object})
        }
        let totalFollowedCustomer = await Dao.countDocuments(Models.follow, totalFollowedPipeline)

        let criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            refundStatus: {
                $in: [
                    APP_CONSTANTS.REFUND_STATUS.REJECTED,
                    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                ]
            },
            transactionType: {$nin: [APP_CONSTANTS.TRANSACTION_TYPES.WALLET]}
        };
        if (payload.startDate & payload.endDate) {
            criteria.createdDate = {
                $lte: payload.endDate,
                $gte: payload.startDate
            }
        }
        let pipeline = [
            {
                $match: criteria
            },
            {
                $project: {
                    transactionId: 1,
                    createdDate: 1,
                    transferred: 1,
                    order: 1,
                    amountWithTax: 1,
                    amount: 1,
                    transactionType: 1
                }
            },
            {
                $addFields: {
                    amountFinal: {
                        $cond: {
                            if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                            then: "$amountWithTax",
                            else: {$multiply: ["$amountWithTax", -1]}
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    amount: {
                        $sum: "$amountFinal"
                    }
                }
            }]

        console.log("pipeline0", JSON.stringify(pipeline))
        let rev = await Dao.aggregateData(Models.transactions, pipeline);
        // let totalSalesPipeline=[{

        // }]
        // let totalSales = await Dao.aggregateData(Models.products, totalSalesPipeline)

        if (rev[0] && rev[0].amount) {
            if (salesRelatedData[0]) {
                salesRelatedData[0].totalRevenue = rev[0].amount
            }
        } else {
            if (salesRelatedData[0]) {
                salesRelatedData[0].totalRevenue = 0
            }
        }
        return {
            totalFollowedCustomer,
            productRelatedData: productRelatedData[0],
            salesRelatedData: salesRelatedData[0]
        }
    } catch (e) {
        throw e;
    }
}

const salesRevenue = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    orderId: 1,
                    productPrice: "$transaction.amountWithTax",
                    quantity: "$transaction.quantity"
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: 1
                },
                createdAt: {
                    $first: "$createdAt"
                },
                totalSale: {
                    $sum: "$productPrice"
                },
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                totalSale: "$totalSale"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        };
        let endDateTime1, startDateTime1, object = {};
        if (payload.endDate) {
            endDateTime1 = +moment(payload.endDate).endOf('day')._d;
            object.$lte = endDateTime1
        }
        if (payload.startDate) {
            startDateTime1 = +moment(payload.startDate).startOf('day')._d;
            object.$gte = startDateTime1
        }
        let groupType = {};

        if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            groupType = {
                $group: {
                    _id: {
                        month: "$_id.month",
                    },
                    totalSale: {
                        $sum: "$totalSale"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };

        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            groupType = {
                $group: {
                    _id: {
                        year: "$_id.year",
                    },
                    totalSale: {
                        $sum: "$totalSale"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };
        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            groupType = {
                $group: {
                    _id: {
                        day: "$_id.day",
                    },
                    totalSale: {
                        $sum: "$totalSale"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            };
        } else {
            groupType = {
                $group: {
                    _id: {
                        date: "$_id.date",
                    },
                    totalSale: {
                        $sum: "$totalSale"
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            }
        }

        let salesPipeline = [{
            $match: {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                ...(payload.startDate && {createdDate: object})
            }
        },
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'transaction'
                }
            },
            {
                $unwind: {
                    path: '$transaction',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "transaction.transactionType": APP_CONSTANTS.TRANSACTION_TYPES.ORDER
                }
            },
            dateProject,
            dateGroup,
            groupType,
            endProject,
            endSort
            // {
            //     $group:{
            //         _id: null,
            //         totalSale: {
            //             $sum: "$productPrice"
            //         },
            //         totalQuantity: {
            //             $sum: "$quantity"
            //         },
            //         totalClosedOrder:{
            //             $sum: 1
            //         }
            //     }
            // },
            // {
            //     $project: {
            //         totalSale: 1,
            //         totalClosedOrder: 1,
            //         averageSale: {
            //             $cond: {
            //                 if: {$eq: [0, "$totalQuantity"]},
            //                 then: 0,
            //                 else: {
            //                     $divide: ["$totalSale", "$totalQuantity"]
            //                 }
            //             }
            //         },
            //         totalRevenue: {
            //             $multiply: [{$cond: {
            //                 if: {$eq: [0, "$totalQuantity"]},
            //                 then: 0,
            //                 else: {
            //                     $divide: ["$totalSale", "$totalQuantity"]
            //                 }
            //             }}, "$totalClosedOrder"]
            //         }
            //     }
            // }
        ]
        return await Dao.aggregateData(Models.orders, salesPipeline)

    } catch (e) {
        throw e
    }
}

const updateStatus = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            _id: userData._id
        }
        let dataToUpdate = {}
        if (payload.status === APP_CONSTANTS.VENDOR_STATUS.ON_AIR) {
            dataToUpdate.maintenance = false
        } else if (payload.status === APP_CONSTANTS.VENDOR_STATUS.OFF_AIR) {
            dataToUpdate.maintenance = true
        } else if (payload.status === APP_CONSTANTS.VENDOR_STATUS.CLOSED) {
            dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.CLOSED,
                dataToUpdate.closedAt = +new Date();
        }

        let updateStatuses = await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, dataToUpdate, {
            lean: true,
            new: true
        });
        // if(payload.status === APP_CONSTANTS.VENDOR_STATUS.CLOSED){
        //     let promises = [Dao.updateMany(Models.products, {vendor: userData._id}, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, { multi:true})];
        //     promises.push(Dao.updateMany(Models.feed, {$or:[{vendor: userData._id}, {vendorId: userData._id}]}, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {multi: true}))
        //     await Promise.all(promises)
        // }
        return updateStatuses
    } catch (e) {
        throw e;
    }
}


const notificationListing = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            receiver: mongoose.Types.ObjectId(userData._id),
            "status": {$nin: [APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.CLEAR, APP_CONSTANTS.STATUS_ENUM.DELETED]}
        };

        let populate = [
            {
                path: 'order',
                select: 'orderId orderNumber subOrderNumber',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS
            },
            {
                path: 'followId',
                select: '_id',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FOLLOWS
            },
            {
                path: 'user',
                select: 'firstName lastName email profilePic',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'vendor',
                select: 'firstName name lastName email profilePic ownerPicture banner',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'product',
                select: 'title description vendor images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
                populate: [{
                    path: 'vendor',
                    select: 'firstName lastName name vendorRegisterName ownerPicture banner',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                }]
            },
            {
                path: 'postId',
                select: 'media mediaType user vendor caption',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
                populate: [
                    {
                        path: 'vendor',
                        select: 'firstName lastName name vendorRegisterName ownerPicture banner',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                    },
                    {
                        path: 'user',
                        select: 'firstName lastName profilePic',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    }
                ]
            },
            {
                path: 'collectionId',
                select: 'name media description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES
            },
            {
                path: 'feed',
                select: 'caption media mediaType hashTag',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
                populate: [
                    {
                        path: 'user',
                        select: 'firstName lastName email profilePic',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    },
                    {
                        path: 'vendor',
                        select: 'firstName name lastName email profilePic ownerPicture banner',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                    },
                    {
                        path: 'collectionId',
                        select: 'name media description',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES
                    }
                ]
            }
        ];
        let pipeline = [
            {
                $match: criteria
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ];
        if (payload.skip) {
            pipeline.push({
                $skip: parseInt(payload.skip)
            })
        }
        if (payload.limit) {
            pipeline.push({
                $limit: parseInt(payload.limit)
            })
        }
        let [data, count] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.notifications, pipeline, populate),
            Dao.countDocuments(Models.notifications, criteria),
            Dao.updateMany(Models.notifications, {
                receiver: userData._id,
                status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD
            }, {status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.READ})
        ]);
        return {data, count}
    } catch (e) {
        throw e;
    }
}

const addOrEditSubVendor = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            let checkVendor = await Dao.findOne(Models.vendors, {
                _id: {$ne: payload.vendorId},
                vendorRegisterName: payload.vendorRegisterName, parentId: userData._id,
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
                userType: APP_CONSTANTS.USER_TYPE.SUB_VENDOR
            }, {_id: 1}, {lean: true});
            if (checkVendor) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NAME_ALREADY_EXISTS
            }
            return await Dao.findAndUpdate(Models.vendors, {
                _id: payload.vendorId
            }, {...payload, updatedDate: +new Date()}, {lean: true, new: true}, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }])
        } else {
            let checkVendor = await Dao.findOne(Models.vendors, {
                vendorRegisterName: payload.vendorRegisterName, parentId: userData._id,
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
                userType: APP_CONSTANTS.USER_TYPE.SUB_VENDOR
            }, {_id: 1}, {lean: true});
            if (checkVendor) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NAME_ALREADY_EXISTS
            }
            payload.parentId = userData._id;
            payload.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
            payload.userType = APP_CONSTANTS.USER_TYPE.SUB_VENDOR;
            payload.hashTag = `${userData.vendorRegisterName.toLowerCase().replace(/\s/g, '')}_${payload.vendorRegisterName.toLowerCase().replace(/\s/g, '')}`;
            payload.firstName = payload.vendorRegisterName;
            payload.lastName = "";
            let checkHash = await checkCreateHashTag(payload.hashTag);
            console.log("checkHashcheckHash", checkHash)
            payload.hashTag = checkHash.hashTag

            let savedData = await Dao.saveData(Models.vendors, payload)
            let dataToReturn = await Dao.populateData(Models.vendors, {_id: savedData._id}, {}, {}, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }])

            let templateData = {
                vendor: savedData._id,
                headerTextColor: APP_CONSTANTS.APP.HEADER_TEXT_COLOR,
                headerColor: APP_CONSTANTS.APP.HEADER_COLOR
            };

            let saveDefaultTemplate = await Dao.saveData(Models.vendorTemplate, templateData);

            return dataToReturn[0]
        }
    } catch (e) {
        throw e
    }
}

const listSubVendor = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            parentId: userData._id,
            userType: APP_CONSTANTS.USER_TYPE.SUB_VENDOR
        }
        let options = {
            lean: true,
            sort: {_id: -1},
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit})
        }
        let [data, count] = await Promise.all([
            Dao.populateData(Models.vendors, criteria, {}, options, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }]),
            Dao.countDocuments(Models.vendors, criteria)
        ])
        return {data, count}
    } catch (e) {
        throw e
    }
}

const deleteSubVendor = async (payload, userData) => {
    try {
        let findVendor = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {_id: 1}, {lean: true});
        if (!findVendor) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
        let dataToUpdate = {
            status: APP_CONSTANTS.STATUS_ENUM.DELETED,
            updatedDate: +new Date()
        }
        return await Dao.findAndUpdate(Models.vendors, {_id: payload.vendorId}, dataToUpdate, {lean: true, new: true})
    } catch (e) {
        throw e
    }
}

const earningGraph = async (payload, userData) => {
    try {

        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let dataToReturn = {};
        let object = {};
        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        object = {$gte: startDateTime1, $lte: endDateTime1};

        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    amountWithTax: 1,
                    amount: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: "$amountWithTax"
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                amount: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        }

        let received = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                refundStatus: {
                    $in: [
                        APP_CONSTANTS.REFUND_STATUS.REJECTED,
                        APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                    ]
                },
                transactionType: {$in: [APP_CONSTANTS.TRANSACTION_TYPES.ORDER]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject, dateGroup];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let deducted = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                refundStatus: {
                    $in: [
                        APP_CONSTANTS.REFUND_STATUS.REJECTED,
                        APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                    ]
                },
                transactionType: {$nin: [APP_CONSTANTS.TRANSACTION_TYPES.ORDER, APP_CONSTANTS.TRANSACTION_TYPES.WALLET]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject,
                dateGroup
            ];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let [receivedAmount, deductionAmount] =
            await Promise.all([
                received(), deducted(),
            ]);
        dataToReturn.received = receivedAmount;
        dataToReturn.deducted = deductionAmount;
        return dataToReturn
    } catch
        (err) {
        throw err;
    }
};

const earningListing = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            duePaymentDays: 1
        }, {sort: {_id: -1}, limit: 1})

        let criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED
        }
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $lte: payload.endDate,
                $gte: payload.startDate
            }
        }
        if (payload.type === APP_CONSTANTS.TRANSACTION_LISTING.ALL) {
            criteria.transactionType = {
                $in: [
                    APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                    APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
                    APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                    APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                    APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                ]
            }
        } else if (payload.type === APP_CONSTANTS.TRANSACTION_LISTING.RECEIVED) {
            criteria.transactionType = {$in: [APP_CONSTANTS.TRANSACTION_TYPES.ORDER]}
        } else if (payload.type === APP_CONSTANTS.TRANSACTION_LISTING.DEDUCTED) {
            criteria.transactionType = {
                $in: [
                    APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION,
                    APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                    APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                    APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                ]
            }
        } else if (payload.type === APP_CONSTANTS.TRANSACTION_LISTING.DUE_PAYMENT) {
            criteria.transactionType = {
                $in:
                    [
                        APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                        APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                        APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                        APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                        APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                        APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
                        APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                        APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                    ]
            };
            criteria.refundStatus = {
                $in: [
                    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
                    APP_CONSTANTS.REFUND_STATUS.REJECTED
                ]
            }
            criteria.transferred = false;
            criteria.createdDate = {
                $lt: +moment().subtract(appDefaults.duePaymentDays ? appDefaults.duePaymentDays : 15, "days")
            }
        } else {
            criteria.transactionType = {
                $in: [
                    APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                    APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                    APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                    APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                ]
            };
            criteria.refundStatus = {
                $in: [
                    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
                    APP_CONSTANTS.REFUND_STATUS.REJECTED
                ]
            }
            criteria.transferred = false;

            criteria.$and = [{
                createdDate: {
                    $lt: +moment().subtract(appDefaults.duePaymentDays ? appDefaults.duePaymentDays : 15, "days")
                }
            }, {
                createdDate: {
                    $lt: +moment().day(1 + 7)
                }
            }]
        }

        if(payload.transactionType) criteria.transactionType = payload.transactionType;
        if(payload.transactionId) criteria.transactionId = new RegExp(await UniversalFunctions.escapeRegex(payload.transactionId), 'i');

        let pipeline = [
            {
                $match: criteria
            },
            {
                $project: {
                    transactionId: 1,
                    createdDate: 1,
                    transferred: 1,
                    order: 1,
                    amountWithTax: 1,
                    amount: 1,
                    productPromoCharges: 1,
                    transactionType: 1,
                    productPaymentMethodChargeTotal: 1,
                    productShippingChargeTotal: 1,
                    vendor: 1,
                    user: 1
                }
            }, {
                $sort: {
                    _id: -1
                }
            }]

        if (payload.skip) {
            pipeline.push({
                $skip: parseInt(payload.skip)
            })
        }

        if (payload.limit) {
            pipeline.push({
                $limit: parseInt(payload.limit)
            })
        }
        let data = await Dao.aggregateData(Models.transactions, pipeline);
        let count = await Dao.countDocuments(Models.transactions, criteria);
        if(payload.isCSV){
            return earningCSV(data)
        }
        else{
            return {data, count}
        }

    } catch (e) {
        throw e
    }
}

const earningCSV = async (data)=>{
    try{
        data = JSON.parse(JSON.stringify(data));
        let fields = [
            "Sr. No.",
            "Transaction Id",
            "Type",
            "Amount",
            "Date",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            invoiceObject = {};
            invoiceObject["Sr. No."] = i + 1;
            invoiceObject["Transaction Id"] = `${data[i].transactionId}`;
            if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.BOUGHT_SUBSCRIPTION){
                data[i].type = "Bought Subscriptions"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES){
                data[i].type = "Return Shipping Charges"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION){
                data[i].type = "VAT Charges"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES){
                data[i].type = "Paid Comission"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES){
                data[i].type = "Shipping Charges"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.ORDER){
                data[i].type = "Received"
            }
            else if(data[i].transactionType === APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY){
                data[i].type = "Penality Charges"
            }
            else{
                data[i].type = data[i].transactionType
            }
            invoiceObject["Type"] = `${data[i].type}`;
            invoiceObject["Amount"] = `${data[i].amountWithTax}`;
            invoiceObject["Date"] = `${moment(data[i].createdDate).format('LL')}`;
            invoiceData.push(invoiceObject);
        }

        const json2csvParser = new Json2csvParser({fields});

        let csv = await json2csvParser.parse(invoiceData);
        console.log("csv",csv)
        return csv;
    }catch (e){
       throw e
    }
}

const earningDashboard = async (payload, userData) => {
    try {
        if (payload && payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let received = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                refundStatus: {
                    $in: [
                        APP_CONSTANTS.REFUND_STATUS.REJECTED,
                        APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                    ]
                },
                transactionType: {$in: [APP_CONSTANTS.TRANSACTION_TYPES.ORDER]}
            };
            if (payload.startDate && payload.endDate) {
                criteria.createdDate = {
                    $lte: payload.endDate,
                    $gte: payload.startDate
                }
            }
            let pipeline = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }]

            console.log("pipeline0", pipeline)
            return await Dao.aggregateData(Models.transactions, pipeline);
        }
        let deduction = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                refundStatus: {
                    $in: [
                        APP_CONSTANTS.REFUND_STATUS.REJECTED,
                        APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                    ]
                },
                transactionType: {$nin: [APP_CONSTANTS.TRANSACTION_TYPES.ORDER, APP_CONSTANTS.TRANSACTION_TYPES.WALLET]}
            };
            if (payload.startDate & payload.endDate) {
                criteria.createdDate = {
                    $lte: payload.endDate,
                    $gte: payload.startDate
                }
            }
            let pipeline = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }]

            console.log("pipeline0", pipeline)
            return await Dao.aggregateData(Models.transactions, pipeline);
        };
        let revenue = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                refundStatus: {
                    $in: [
                        APP_CONSTANTS.REFUND_STATUS.REJECTED,
                        APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED
                    ]
                },
                transactionType: {$nin: [APP_CONSTANTS.TRANSACTION_TYPES.WALLET]}
            };
            if (payload.startDate & payload.endDate) {
                criteria.createdDate = {
                    $lte: payload.endDate,
                    $gte: payload.startDate
                }
            }
            let pipeline = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountFinal"
                        }
                    }
                }]

            console.log("pipeline0", JSON.stringify(pipeline))
            return await Dao.aggregateData(Models.transactions, pipeline);

        };

        let nextDuePayment = async () => {
            let criteria = {
                vendor: mongoose.Types.ObjectId(userData._id),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            };
            // if(payload.startDate & payload.endDate){
            //     criteria.createdDate = {
            //         $lte: payload.endDate,
            //         $gte: payload.startDate
            //     }
            // }
            criteria.transactionType = {
                $in: [
                    APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                    APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.REDIRECTION_CHARGES,
                    APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                ]
            };
            criteria.refundStatus = {
                $in: [
                    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
                    APP_CONSTANTS.REFUND_STATUS.REJECTED
                ]
            }
            let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
                duePaymentDays: 1
            }, {sort: {_id: -1}, limit: 1})

            criteria.transferred = false;
            criteria.$and = [{
                createdDate: {
                    $lt: +moment().subtract(appDefaults.duePaymentDays ? appDefaults.duePaymentDays : 15, "days")
                }
            }, {
                createdDate: {
                    $lt: +moment().day(1 + 7)
                }
            }]
            let pipeline = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }]

            console.log("pipeline0", JSON.stringify(pipeline))
            return await Dao.aggregateData(Models.transactions, pipeline);

        }
        let [receivedAmount, deductionAmount, revenueAmount, nextDuePayments] = await Promise.all([received(), deduction(), revenue(), nextDuePayment()]);

        return {
            receivedAmount: receivedAmount[0] && receivedAmount[0].amount ? receivedAmount[0].amount : 0,
            deductionAmount: deductionAmount[0] && deductionAmount[0].amount ? deductionAmount[0].amount : 0,
            revenueAmount: revenueAmount[0] && revenueAmount[0].amount ? revenueAmount[0].amount : 0,
            nextDuePayment: nextDuePayments[0] && nextDuePayments[0].amount ? nextDuePayments[0].amount : 0
        }
    } catch (e) {
        throw e
    }
}

const specialTransferRequest = async (payload, userData) => {
    try {
        let dataToSave = {
            vendor: userData._id,
            transaction: payload.transaction,
            amount: payload.amount,
            reason: payload.reason,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            requiredOnDate: payload.requiredOnDate,
        };
        return await Dao.saveData(Models.transferRequest, dataToSave)
    } catch (e) {

    }
}

const createSubManagingAccount = async (payload, userData) => {
    try {
        if (payload._id) {
            let checkVendor = await Dao.findOne(Models.vendors, {
                _id: {$ne: payload._id},
                email: payload.email,
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            }, {_id: 1}, {lean: true});
            if (checkVendor) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST
            }
            if (payload.password) payload.password = await UniversalFunctions.bCryptData(payload.password);
            return await Dao.findAndUpdate(Models.vendors, {
                _id: payload._id
            }, {...payload, updatedDate: +new Date()}, {lean: true, new: true}, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }])
        } else {
            let checkVendor = await Dao.findOne(Models.vendors, {
                email: payload.email,
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            }, {_id: 1}, {lean: true});
            if (checkVendor) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST
            }
            payload.parentId = userData._id;
            payload.isVerified = true;
            payload.isAdminVerified = true;

            payload.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
            payload.userType = APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT;
            if (payload.password) payload.password = await UniversalFunctions.bCryptData(payload.password);
            payload.hashTag = `${userData.vendorRegisterName.toLowerCase().replace(/\s/g, '')}_${payload.vendorRegisterName.toLowerCase().replace(/\s/g, '')}`;

            let checkHash = await checkCreateHashTag(payload.hashTag);
            console.log("checkHashcheckHash", checkHash)
            payload.hashTag = checkHash.hashTag

            let savedData = await Dao.saveData(Models.vendors, payload)
            let dataToReturn = await Dao.populateData(Models.vendors, {_id: savedData._id}, {}, {}, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }])

            let templateData = {
                vendor: savedData._id,
                headerTextColor: APP_CONSTANTS.APP.HEADER_TEXT_COLOR,
                headerColor: APP_CONSTANTS.APP.HEADER_COLOR
            };

            let saveDefaultTemplate = await Dao.saveData(Models.vendorTemplate, templateData);

            return dataToReturn[0]
        }
    } catch (e) {
        throw e
    }
}

const listManagingAccounts = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            parentId: userData._id,
            userType: APP_CONSTANTS.USER_TYPE.VENDOR_MANAGING_ACCOUNT,
            ...(payload._id && {_id: payload._id})
        }
        let options = {
            lean: true,
            sort: {_id: -1},
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit})
        }
        let [data, count] = await Promise.all([
            Dao.populateData(Models.vendors, criteria, {password: 0}, options, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }]),
            Dao.countDocuments(Models.vendors, criteria)
        ])
        return {data, count}
    } catch (e) {
        throw e
    }
}

const updateTheme = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, {
            themeType: payload.themeType
        }, {})

        return await getProfile(userData)
    } catch (e) {
        throw e;
    }
}

const updateSubscriptionRenewal = async (payload, userData) => {
    try {
        await Dao.findAndUpdate(Models.vendors, {_id: userData._id}, {autoRenewal: payload.autoRenewal}, {});
        return getProfile(userData);
    } catch (e) {
        throw e;
    }
}
const userVendorDetails = async (payload, userData) => {
    try {
        let dataToSend = {}
        if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.USER) {
            let pipeline = [{
                $match: {
                    _id: mongoose.Types.ObjectId(payload.id)
                }
            },
                {
                    $lookup: {
                        from: "follows",
                        let: {},
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$followType", APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER]},
                                                        {$eq: ["$sender", mongoose.Types.ObjectId(payload.id)]},
                                                        {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW]},
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1}}
                        ],
                        as: "followedUser"
                    }
                },
                {
                    $addFields: {
                        followedUserCount: {$size: '$followedUser'}
                    }
                },
                {
                    $lookup: {
                        from: "follows",
                        let: {},
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$followType", APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR]},
                                                        {$eq: ["$sender", mongoose.Types.ObjectId(payload.id)]},
                                                        {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW]},
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1}}
                        ],
                        as: "followedVendor"
                    }
                },
                {
                    $addFields: {
                        followedVendorCount: {$size: '$followedVendor'}
                    }
                },
                {
                    $project: {
                        followedVendor: 0,
                        followedUser: 0
                    }
                }, {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        profilePic: 1,
                        createdDate: 1,
                        createdAt: 1,
                        active: 1,
                        activeAgo: 1,
                        followedVendorCount: 1,
                        followedUserCount: 1,
                    }
                }];
            let data = await Dao.aggregateData(Models.user, pipeline);
            console.log("data", data)
            if (data[0]) {
                let feed = await FeedController.listFeed({user: payload.id}, userData);
                data[0].feedCount = feed.count
            }
            dataToSend = data[0] ? data[0] : null
        } else {
            dataToSend = await Dao.findOne(Models.vendors, {
                _id: payload.id
            }, {
                firstName: 1,
                lastName: 1,
                name: 1,
                vendorRegisterName: 1,
                ownerPicture: 1,
                email: 1,
                profilePic: 1,
                active: 1,
                activeAgo: 1
            }, {
                lean: true
            })
        }
        if (dataToSend) {
            if (userData) {
                let findMessage = await Dao.findOne(Models.chat, {
                    $and: [{
                        $or: [
                            {
                                // deletedFor: {
                                //     $elemMatch: {
                                //         id: {
                                //             $ne: mongoose.Types.ObjectId(userData._id)
                                //         }
                                //     }
                                // }
                                "deletedFor.id": {
                                    $ne: mongoose.Types.ObjectId(userData._id)
                                }
                            },
                            {
                                deletedFor: []
                            }
                        ]
                    }, {
                        $or: [{sender: userData._id, receiver: payload.id}, {
                            receiver: mongoose.Types.ObjectId(userData._id),
                            sender: mongoose.Types.ObjectId(payload.id)
                        }]
                    }]
                })
                if (findMessage) {
                    let findMuteChat = await Dao.findOne(Models.chat, {
                        _id: findMessage._id,
                        // muteBy: {
                        //     $elemMatch: {
                        //         id: {
                        //             $ne: mongoose.Types.ObjectId(userData._id)
                        //         }
                        //     }
                        // }
                        "muteBy.id": {
                            $ne: mongoose.Types.ObjectId(userData._id)
                        }
                    }, {}, {});
                    if (findMuteChat) {
                        dataToSend.chatMute = false
                    } else {
                        dataToSend.chatMute = true
                    }
                } else {
                    dataToSend.chatMute = false
                }
            } else {
                dataToSend.chatMute = false
            }
        }


        return dataToSend
    } catch (e) {
        throw e
    }
}


module.exports = {
    signUp: signUp,
    logIn: logIn,
    verifyAccount: verifyAccount,
    resendOTP: resendOTP,
    addOrEditProfile: addOrEditProfile,
    logout: logout,
    uploadFile: uploadFile,
    getProfile: getProfile,
    settings: settings,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    changePassword: changePassword,
    selectTemplate: selectTemplate,
    secondStep: secondStep,
    thirdStep: thirdStep,
    fourthStep: fourthStep,
    fifthStep: fifthStep,
    deviceTokenUpdate: deviceTokenUpdate,
    analytics: analytics,
    checkVendor: checkVendor,
    contactUsIssue: contactUsIssue,
    soldProducts: soldProducts,
    addOrEditBank: addOrEditBank,
    listBanks: listBanks,
    deleteBank: deleteBank,
    setAsDefaultBank: setAsDefaultBank,
    dashboard: dashboard,
    salesRevenue: salesRevenue,
    updateStatus: updateStatus,
    notificationListing: notificationListing,
    addOrEditSubVendor: addOrEditSubVendor,
    listSubVendor: listSubVendor,
    deleteSubVendor: deleteSubVendor,
    earningGraph: earningGraph,
    earningListing: earningListing,
    earningDashboard: earningDashboard,
    specialTransferRequest: specialTransferRequest,
    updateTheme: updateTheme,
    createSubManagingAccount: createSubManagingAccount,
    listManagingAccounts: listManagingAccounts,
    updateSubscriptionRenewal: updateSubscriptionRenewal,
    userVendorDetails: userVendorDetails
};
