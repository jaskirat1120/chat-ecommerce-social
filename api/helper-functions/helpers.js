// constants imported
const RESPONSE_MESSAGES = require('../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../config').constants.appDefaults;

// local modules
const Dao = require('../../dao').queries;
const checkUserEmail = async (payloadData, model, type) => {
    let criteria = {
        email: new RegExp("^" + payloadData.email + "$", "i"),
        status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
    };

    if (type) criteria.userType = type;

    let userData = await Dao.getData(model, criteria, {}, {lean: true, new: true});


    if (userData && userData.length) {
        return {userExists: true}
    } else {
        return {userExists: false}
    }
};


const checkUserPhone = async (payload, model, type) => {
    if (payload.phoneNumber.length > 18) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_VALIDATION;

    let countryCode = payload.countryCode;
    let phoneNumber = payload.phoneNumber;
    let criteria = {
        'phoneNumber.countryCode': countryCode.toString(),
        'phoneNumber.phoneNo': phoneNumber.toString(),
        status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
    };
    if (type) criteria.userType = type;

    let userData = await Dao.findOne(model, criteria, {}, {lean: true});

    if (userData && userData.phoneNumber) {
        return {userExists: true}
    } else {
        return {userExists: false}
    }
};


const checkSocialUser = async (payload) => {
    let criteria = {
        status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
    };
    if (payload.socialId && payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.FACEBOOK)
        criteria.facebookId = payload.socialId;
    else if (payload.socialId && payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.INSTAGRAM)
        criteria.instagramId = payload.socialId;
    else if (payload.socialId && payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.GOOGLE)
        criteria.googleId = payload.socialId;
    else if (payload.socialId && payload.signUpBy === APP_CONSTANTS.SCHEMA_ENUMS.USER.SIGNUP_TYPE.APPLE)
        criteria.appleId = payload.socialId;
    else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.SOCIAL_REQUIRED;
    console.log({criteria})
    let userData = await Dao.findOne(Models.user, criteria, {}, {lean: true});
    console.log({userData})
    if (userData) {
        return {userExists: true, id: userData._id}
    } else {
        return {userExists: false}
    }
};

module.exports = {
    checkUserEmail: checkUserEmail,
    checkUserPhone: checkUserPhone,
    checkSocialUser: checkSocialUser
}
