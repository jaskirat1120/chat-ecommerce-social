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
const FeedController = require('../../user/feed/controller');
const AdminHelperFunction = require('../../helper-functions/admin');
const EmailHandler = require('../../email-helpers/emailHandler');
const validator = require("email-validator");
const moment = require("moment");
const mongoose = require("mongoose");


const signUp = async (payload) => {
    try {
        let issuedAt = +new Date();
        let phoneCheck, emailCheck;

        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456";


        phoneCheck = await CommonHelper.checkUserPhone(payload, Models.user, APP_CONSTANTS.USER_TYPE.USER);

        if (phoneCheck.userExists) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST;
        }

        emailCheck = await CommonHelper.checkUserEmail(payload, Models.user, APP_CONSTANTS.USER_TYPE.USER);
        if (emailCheck && emailCheck.userExists) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST;
        }

        payload.OTP = otp;

        payload.OTPExpiry = +moment().add(5, 'minutes');  //otp Expires in 5 minute
        payload.issuedAt = issuedAt;  // For access Token expiry
        payload.verificationLink = issuedAt + (24 * 60 * (60000));
        let register = await registerUser(payload, phoneCheck);

        let message=`Dear User, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
        await smsManager.sendMessage('+'+(register.phoneNumber.countryCode).toString()+(register.phoneNumber.phoneNo.toString()),message)

        await EmailHandler.sendEmailSignUp(payload, APP_CONSTANTS.USER_TYPE.USER);

        let tokenData = {
            _id: register._id,
            scope: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            issuedAt: issuedAt
        };
        register.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.USER);
        delete register.password;
        return register;
    } catch (err) {
        throw err;
    }
};

const registerUser = async (payloadData, check1) => {

    console.log("INSIDE REGISTER FUNCTION", check1);

    try {
        let criteria = {};
        let dataToUp = {
            firstName: payloadData.firstName ? payloadData.firstName : '',
            lastName: payloadData.lastName ? payloadData.lastName : '',
            signUpBy: payloadData.signUpBy,
            deviceType: payloadData.deviceType,
            isVerified: false,
            OTP: payloadData.OTP ? payloadData.OTP : '',
            OTPExpiry: payloadData.OTPExpiry,
            issuedAt: payloadData.issuedAt,
            ...(payloadData.interests && {interests: payloadData.interests}),
            userType: APP_CONSTANTS.USER_TYPE.USER,
            language: payloadData.language,
            updatedDate: +new Date(),
            ...(payloadData.email && {email: payloadData.email}),
            ...(payloadData.password && {password: await UniversalFunctions.bCryptData(payloadData.password)})
        };

        if (payloadData.deviceToken) {
            dataToUp.deviceToken = payloadData.deviceToken;
            await Dao.updateMany(Models.user, {deviceToken: payloadData.deviceToken}, {deviceToken: ''}, {new: true});
        }

        if (payloadData.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.NORMAL) {

            console.log("INSIDE NORMAL SIGNUP");


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
                criteria = {
                    'phoneNumber.countryCode': countryCode.toString(),
                    'phoneNumber.phoneNo': phoneNumber.toString(),
                };
            }
        } else {
            console.log("INSIDE SOCIAL SIGNUP");
            if (payloadData.email) {
                dataToUp.email = payloadData.email;
                criteria.email =/* payloadData.email;*/new RegExp("^" + payloadData.email + "$", "i")
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
                criteria = {
                    'phoneNumber.countryCode': countryCode.toString(),
                    'phoneNumber.phoneNo': phoneNumber.toString(),
                };
            }
        }
        if (payloadData.socialId && payloadData.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.FACEBOOK) {
            dataToUp.facebookId = payloadData.socialId;
            dataToUp.signUpBy = APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.FACEBOOK;
        }
        if (payloadData.socialId && payloadData.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE) {
            dataToUp.googleId = payloadData.socialId;
            dataToUp.signUpBy = APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE;

        }
        if (payloadData.socialId && payloadData.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.INSTAGRAM) {
            dataToUp.instagramId = payloadData.socialId;
            dataToUp.signUpBy = APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.INSTAGRAM;
        }
        if (payloadData.socialId && payloadData.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.APPLE) {
            dataToUp.appleId = payloadData.socialId;
            dataToUp.signUpBy = APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.APPLE;
        }
        let dataToReturn;
        if (payloadData.socialId && check1 && check1.userExists === true) {

            console.log("INSIDE SOCIAL SIGNUP AND USER ALREADY EXISTS");

            dataToReturn = await Dao.findAndUpdate(Models.user, {_id: check1.id}, {issuedAt: payloadData.issuedAt,
                ...(payloadData.interests && {interests: payloadData.interests}),
                ...(payloadData.profilePic && {profilePic: payloadData.profilePic})
            }, {
                lean: true,
                new: true
            });
            dataToReturn.isSocialLogin = true;

        } else if (payloadData.socialId && check1 && check1.userExists === false) {
            console.log("INSIDE SOCIAL SIGNUP AND USER DOES NOT EXISTS");
            console.log("criteriacriteriacriteria", criteria)
            if(criteria !=={} && Object.keys(criteria).length !==0){
                criteria.status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            }
            let getData = await Dao.findOne(Models.user, criteria, {}, {lean: true, new: true});
            if (getData && criteria && criteria !=={} && Object.keys(criteria).length !==0) {
                delete dataToUp.signUpBy;
                dataToUp.isVerified = true;
                dataToReturn = await Dao.findAndUpdate(Models.user, {_id: getData._id}, dataToUp, {
                    lean: true,
                    new: true
                });
                dataToReturn.isSocialLogin = true;
                delete dataToReturn.__v;
                delete dataToReturn.password;
            } else {
                dataToUp.isVerified = true;
                dataToUp.createdDate = +new Date();
                if(payloadData.profilePic) dataToUp.profilePic = payloadData.profilePic; 
                dataToReturn = await Dao.saveData(Models.user, dataToUp);
                dataToReturn.isSocialLogin = true;
                delete dataToReturn.__v;
                delete dataToReturn.password;
            }
        } else {
            dataToUp.createdDate = +new Date();
            dataToUp.updatedDate = +new Date();
            if(payloadData.profilePic) dataToUp.profilePic = payloadData.profilePic;
            dataToReturn = await Dao.saveData(Models.user, dataToUp);
            delete dataToReturn.__v;
            delete dataToReturn.password;
        }

        console.log("dataToReturn", dataToReturn)

        if (payloadData.address) {
            if (payloadData.address.lat && payloadData.address.long) {
                payloadData.address.latLong = [payloadData.address.long, payloadData.address.lat];
            }
            payloadData.address.user = dataToReturn._id;
            await Dao.saveData(Models.userAddresses, payloadData.address);
        }
        if(!dataToReturn.interests || dataToReturn.interests && dataToReturn.interests.length){
            dataToReturn.interestAdded = false
        }
        else{
            dataToReturn.interestAdded = true
        }
        delete dataToReturn.__v;
        delete dataToReturn.password;
        return dataToReturn

    } catch (e) {
        console.log("eeeeeeeeeeee  ", e);
        throw e;
    }
};


const logIn = async (payload) => {
    try {
        let check1;
        let issuedAt = +new Date();
        payload.issuedAt = issuedAt;
        check1 = await verifyUser(payload, APP_CONSTANTS.USER_TYPE.USER);
        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456";
        let dataToUpdate = {
            issuedAt: issuedAt,
            lastLogin: +new Date(),
            activeAgo: +new Date(),
            deviceType: payload.deviceType,
            OTPExpiry: +moment().add(5, "minutes"),
            isVerified: false,
            OTP: otp,
            language: payload.language,
        };
        if (payload.deviceToken) {
            dataToUpdate.deviceToken = payload.deviceToken;
            await Dao.updateMany(Models.user, {deviceToken: payload.deviceToken}, {deviceToken: ''}, {new: true});
        }

        let message=`Dear User, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
        await smsManager.sendMessage('+'+(check1.phoneNumber.countryCode).toString()+(check1.phoneNumber.phoneNo.toString()),message);

        await Dao.findAndUpdate(Models.user, {_id: check1._id}, dataToUpdate, {lean: true, new: true});
        check1.isVerified = false;
        return check1;

    } catch (err) {
        throw err;
    }
};


let getProfile = async (userData) => {
    try {
        let criteria = {
            _id: userData._id
        };

        let UserData = await Dao.findOne(Models.user, criteria, {}, {lean: true});

        if (UserData && UserData._id) {
            delete UserData.password;
            delete UserData.__v;
            let unReadNotifications = await Dao.countDocuments(Models.notifications, {receiver: userData._id, status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD})
            userData.unReadNotifications = unReadNotifications;
            return UserData;
        }

    } catch (e) {
        throw e;
    }
};


const verifyUser = async (payloadData, type) => {
    return new Promise(async (resolve, reject) => {
        let criteria = {};
        if (payloadData.email) {
            criteria.email = /*payloadData.email*/new RegExp("^" + payloadData.email + "$", "i");
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
        let userData = await Dao.findOne(Models.user, criteria, {}, {lean: true});

        if (!!userData && userData._id) {
            if (userData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
            }
            if (!userData.password || (userData.password && !(await UniversalFunctions.compareCryptData(payloadData.password, userData.password))))
                reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_PASSWORD);
            else {
                let tokenData = {
                    _id: userData._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.USER,
                    issuedAt: payloadData.issuedAt
                };

                // userData.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.USER);
                delete userData.__v;
                delete userData.password;
                delete userData.OTP;
                delete userData.OTPExpiry;
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
            },
            dataToUp = {
                profileStatus: APP_CONSTANTS.PROFILE_ENUM.ADDED,
                ...(payload.interests && {interests: payload.interests}),
                ...(payload.privacyType && {privacyType: payload.privacyType}),
                ...(payload.notifications && {notifications: payload.notifications}),
                ...(payload.dob && {dob: payload.dob}),
                ...(payload.gender && {gender: payload.gender}),
                ...(payload.city && {city: payload.city}),
                ...(payload.currency && {currency: payload.currency}),
                ...(payload.language && {language: payload.language}),
            };
        if (payload.notifications || payload.notifications === false) {
            dataToUp.notifications = payload.notifications;
        }
        if (payload.firstName) {
            dataToUp.firstName = payload.firstName;
        }
        if (payload.email && payload.email !== '') {
            dataToUp.email = payload.email;
            let data = await Dao.findOne(Models.user, {
                email: new RegExp("^" + payload.email + "$", "i")/*payload.email*/,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                _id: {$ne: userData._id}
            }, {_id: 1}, {lean: true});
            if (data) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST;
            }
        }
        if (payload.email === '') {
            dataToUp.email = '';
        }
        if (payload.phoneNumber && payload.phoneNumber.phoneNo !== '') {
            if (payload.phoneNumber.length > 18) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_VALIDATION;
            }
            let countryCode = payload.phoneNumber.countryCode;
            let phoneNumber = payload.phoneNumber.phoneNo;
            dataToUp.phoneNumber = {
                countryCode: countryCode.toString(),
                phoneNo: phoneNumber.toString(),
                ISO: payload.ISO
            };
            let criteria = {
                'phoneNumber.countryCode': countryCode.toString(),
                'phoneNumber.phoneNo': phoneNumber.toString(),
                userType: APP_CONSTANTS.USER_TYPE.USER,
                _id: {$ne: userData._id}
            };
            let data = await Dao.findOne(Models.user, criteria, {_id: 1}, {lean: true});
            if (data) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST;
            }
        }
        if (payload.phoneNumber && payload.phoneNumber.phoneNo === '') {
            dataToUp.phoneNumber = {};
        }

        if (payload.profilePic) {
            dataToUp.profilePic = payload.profilePic;
        }

        if (payload.bio) {
            dataToUp.bio = payload.bio;
        }

        if (payload.address) {
            if (payload.address.lat && payload.address.long) {
                payload.address.latLong = [payload.address.long, payload.address.lat];
            }
            payload.address.user = payload._id;
            await Dao.saveData(Models.userAddresses, payload.address);
        }

        let dataUpdated = await Dao.findAndUpdate(Models.user, criteria, dataToUp, {
            lean: true,
            new: true
        });
        delete dataUpdated.__v;
        delete dataUpdated.password;
        console.log("dataUpdated", dataUpdated);
        return dataUpdated;
    } catch (err) {
        throw err;
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
        await Dao.findAndUpdate(Models.user, criteria, dataToUp, {lean: true, new: true});
        return {};
    } catch (err) {
        throw err;
    }
};


let checkUser = async (payload) => {
    try {

        if (payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.EMAIL || validator.validate(payload.auth)) {
            return await CommonHelper.checkUserEmail(payload, Models.user, APP_CONSTANTS.USER_TYPE.USER);
        }
        if (payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.PHONE_NUMBER) {
            return await CommonHelper.checkUserPhone(payload, Models.user, APP_CONSTANTS.USER_TYPE.USER);
        }
    } catch (e) {
        throw e;
    }
};


let verifyAccount = async (payload) => {
    try {
        let criteria = {
            'phoneNumber.countryCode': payload.countryCode.toString(),
            'phoneNumber.phoneNo': payload.phoneNumber.toString(),
            userType: APP_CONSTANTS.USER_TYPE.USER
        };
        let get = await Dao.getData(Models.user, criteria, {isVerified: 1, OTP: 1, OTPExpiry: 1}, {lean: true});
        if (get.length) {
            if (/*payload.OTP !== '123456' && */ get[0].OTP !== payload.OTP) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            }
            else if(get[0].OTPExpiry < +new Date()) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            } else {
                let issuedAt = +new Date();
                let dataToUpdate = {isVerified: true, OTP: '', issuedAt: issuedAt};
                let tokenData = {
                    _id: get[0]._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.USER,
                    issuedAt: issuedAt
                };

                let updatedData = await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
                updatedData.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.USER);
                delete updatedData.__v;
                delete updatedData.password;
                console.log("updatedData", JSON.stringify(updatedData))
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
    if (payload.newRegistration) {
        let countryCode = payload.countryCode;
        let phoneNumber = payload.phoneNumber;
        let criteria = {
            'phoneNumber.countryCode': countryCode.toString(),
            'phoneNumber.phoneNo': phoneNumber.toString(),
            userType: APP_CONSTANTS.USER_TYPE.USER
        };

        let findUser = await Dao.findOne(Models.user, criteria, {_id: 1}, {lean: true});
        if (findUser) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST;
        } else {
            // let otp = "123456";
            let otp = await UniversalFunctions.generateRandomOTP();

            let message = `Dear User, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
            await smsManager.sendMessage(payload.countryCode.toString()+payload.phoneNumber.toString(), message)
            //

            // let updatedData = await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {
            //     lean: true,
            //     new: true
            // });
            return {
                // OTP: otp
            };
        }
    } else {
        criteria = {
            'phoneNumber.countryCode': payload.countryCode.toString(),
            'phoneNumber.phoneNo': payload.phoneNumber.toString(),
            userType: APP_CONSTANTS.USER_TYPE.USER
        };
        let data = await Dao.findOne(Models.user, criteria, {}, {lean: true});
        if (data) {
            let otp = await UniversalFunctions.generateRandomOTP();
            // let otp = "123456";
            let dataToUpdate = {
                OTP: otp,
                OTPExpiry: +moment().add(5, "minutes"),
            };
            let message=`Dear User, your One Time Password (OTP) is ${otp}, valid for the next 5 Minutes. Thanks for registering with MYVENDORS.`;
            await smsManager.sendMessage('+'+data.phoneNumber.countryCode.toString()+data.phoneNumber.phoneNo.toString(),message)
            //
            await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {lean: true, new: true});
            return {
                // OTP: otp
            };
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_REGISTERED;
        }
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



let forgotPassword = async (payload) => {
    try {
        let criteria = {}, dataToUpdate = {};
        if (validator.validate(payload.email)) {
            criteria.email = new RegExp("^" + payload.email + "$", "i")/*payload.email*/;
            let getData = await Dao.findOne(Models.user, criteria, {}, {lean: true});
            if (getData) {
                if (getData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
                // else if (getData.isVerified === false) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.VERIFY_ACCOUNT_FORGOT);
                else { 
                    let otp = await UniversalFunctions.generateRandomOTP();
                    // let otp = "123456";
                    dataToUpdate.resetPasswordExpiry = otp;
                    let url = `${process.env.RESET_PASSWORD_USER}/${getData._id}/${dataToUpdate.resetPasswordExpiry}`;
                    await EmailHandler.sendEmailForgotPassword(getData, url, otp);
                    await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {lean: true, new: true});
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


const socialSignUpOrLogIn = async (payload) => {
    try {
        let issuedAt = +new Date();
        let check1 = await CommonHelper.checkSocialUser(payload);
        payload.issuedAt = issuedAt;
        let register = await registerUser(payload, check1);

        let tokenData = {
            _id: register._id,
            scope: APP_CONSTANTS.AUTH_STRATEGIES.USER,
            issuedAt: issuedAt
        };

        register.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.USER);

        await Dao.findAndUpdate(Models.user, {_id: register._id}, {
            issuedAt: issuedAt
        }, {})

        delete register.password;
        return register;
    } catch (err) {
        throw err;
    }
};


let resetPassword = async (payload) => {
    try {
        return await AdminHelperFunction.resetPassword(payload, Models.user);
    } catch (e) {
        console.log(e);
        throw e
    }
};


let joinNewsLetter = async (payload) => {
    try {
        payload.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
        payload.createdDate = +new Date();
        payload.updatedDate = +new Date();
        return await Dao.findAndUpdate(Models.newsLetters, {email: payload.email}, payload, {upsert: true, new: true});
    } catch (e) {
        console.log(e);
        throw e
    }
};


const changePassword = async (payload, userData) => {
    try {
        return await HelperCommonFunction.changePassword(payload, userData, Models.user);
    } catch (err) {
        throw err;
    }
};

const deviceTokenUpdate = async (payload, userData) => {
    try {
        return await HelperCommonFunction.updateDeviceToken(payload, userData);
    } catch (e) {
        throw e;
    }
};

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

const tokenLogin = async (userData) => {
    try {
        let pipeline = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(userData._id)
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
                                                    {$eq: ["$sender", mongoose.Types.ObjectId(userData._id)]},
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
                                                    {$eq: ["$sender", mongoose.Types.ObjectId(userData._id)]},
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
            }];
        let user = await Dao.aggregateData(Models.user, pipeline);
        if (user[0]) {
            let feed = await FeedController.listFeed({user: userData._id}, userData);
            let unReadNotifications = await Dao.countDocuments(Models.notifications, {receiver: userData._id, status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD})

            let c1 = {
                receiver: mongoose.Types.ObjectId(userData._id)
            };
            let criteriaMessages = {
                $and: [{
                    $or: [
                        {
                            "deletedFor.id": {
                                $ne: mongoose.Types.ObjectId(userData._id)
                            }
                        },
                        {
                            deletedFor: []
                        }
                    ]
                }, {$or: [c1]}],
            }
            criteriaMessages.chatWith = APP_CONSTANTS.FEED_LIST_TYPE.USER;
            let unReadMessages = await Dao.countDocuments(Models.chat, criteriaMessages)
            criteriaMessages.chatWith = APP_CONSTANTS.FEED_LIST_TYPE.VENDOR;
            let unReadMessagesVendor = await Dao.countDocuments(Models.chat, criteriaMessages)
            let giftCardCount = await Dao.countDocuments(Models.offerAndPromo, {user: userData._id, status: APP_CONSTANTS.STATUS_ENUM.ACTIVE, expiry: {$gte: +new Date()}, type: APP_CONSTANTS.PROMO_TYPE.GIFT_CARD})
            user[0].feedCount = feed.count
            user[0].unReadNotifications = unReadNotifications
            user[0].unReadMessages = unReadMessages
            user[0].unReadMessagesVendor = unReadMessagesVendor
            user[0].giftCardCount = giftCardCount
        }
        return user[0]
    } catch (e) {
        throw e
    }
};


let getAppDefaults = async (payload) => {
    try {
        return await Dao.findOne(Models.appDefaults, {}, {
            ...payload
        }, {lean: true})

    } catch (e) {
        throw e
    }
};



let getPress = async (payload) => {
    try {
        return await Dao.findOne(Models.press, {}, {
            ...payload
        }, {lean: true})

    } catch (e) {
        throw e
    }
};
const notificationListing = async (payload, userData) => {
    try {
        let followings = [];
        if (userData) {
            let findFollowings = await Dao.getData(Models.follow, {
                sender: userData._id,
                status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER
            });
            followings = findFollowings.map(items => {
                return mongoose.Types.ObjectId(items.receiver)
            })
        }
        let criteria = {
            $or:[
                {receiver: mongoose.Types.ObjectId(userData._id)},
                {notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADDED_COLLECTION},
                {
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_VENDOR,
                    $or: [
                        {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
                        selectedId: mongoose.Types.ObjectId(userData._id)
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        user: {$in: followings}
                    }]
                },
                {notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_PRODUCT,
                    $or: [
                        {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
                        selectedId: mongoose.Types.ObjectId(userData._id)
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        user: {$in: followings}
                    }
                ]
            },
                {notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_POST,
                    $or: [
                        {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
                        selectedId: mongoose.Types.ObjectId(userData._id)
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        user: {$in: followings}
                    }]},
            ],
            "status": {$nin:[APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.CLEAR, APP_CONSTANTS.STATUS_ENUM.DELETED]}
        };
        if (payload.type) {
            if (payload.type === APP_CONSTANTS.NOTIFICATION_LISTING_TYPE.ORDER) {
                criteria.notificationType = {
                    $in: [
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_USER,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_VENDOR,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PLACED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ACCEPTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.REJECTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.DISPATCHED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.IN_TRANSIT,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.DELIVERED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PACKED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_INITIATED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_ACCEPTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ON_HOLD_DAMAGED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ON_HOLD,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHIPMENT_RETURN_IN_PROGRESS,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHIPMENT_RETURNED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.OUT_FOR_DELIVERY,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ATTEMPTED_DELIVERY,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.UNABLE_TO_LOCATE,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED_VENDOR,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REJECTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_COMPLETED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_VENDOR,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.PLACED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.ACCEPTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.REJECTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.DISPATCHED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.IN_TRANSIT,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.DELIVERED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.CANCELLED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.PACKED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.RETURN_INITIATED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.RETURN_ACCEPTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.RETURN_COMPLETED,
                    ]
                }
            } else {
                criteria.notificationType = {
                    $in: [
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.COMMENTED_POST,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_POST,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_VENDOR,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADDED_COLLECTION,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_DISCOUNT,
                        APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_PRODUCT,
                    ]
                }
            }
        }
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
                path: 'discount',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO
            },
            {
                path: 'user',
                select: 'firstName lastName email profilePic',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'vendor',
                select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'product',
                select: 'title description vendor images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
                populate: [{
                    path: 'vendor',
                    select: 'firstName lastName name vendorRegisterName ownerPicture banner vendorRegisterName',
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
                        select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
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
                        select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
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
            Dao.updateMany(Models.notifications, {receiver: userData._id, status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD}, {status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.READ})
        ]);
        return {data, count}
    } catch (e) {
        throw e;
    }
}

const closeAccount = async (payload, userData)=>{
    try{
        return Dao.findAndUpdate(Models.user, {_id: userData._id}, {
            status: payload.status,
            closedAt: +new Date()
        }, {lean: true});
    }catch(e){
        throw e
    }
}

module.exports = {
    signUp: signUp,
    logIn: logIn,
    checkUser: checkUser,
    verifyAccount: verifyAccount,
    resendOTP: resendOTP,
    addOrEditProfile: addOrEditProfile,
    logout: logout,
    uploadFile: uploadFile,
    getProfile: getProfile,
    socialSignUpOrLogIn: socialSignUpOrLogIn,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    changePassword: changePassword,
    deviceTokenUpdate: deviceTokenUpdate,
    joinNewsLetter: joinNewsLetter,
    userVendorDetails: userVendorDetails,
    tokenLogin: tokenLogin,
    getAppDefaults: getAppDefaults,
    getPress: getPress,
    notificationListing: notificationListing,
    closeAccount: closeAccount
};
