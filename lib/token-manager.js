'use strict';
// npm modules
const jwt = require('jsonwebtoken');

// constants imported
const CONSTANTS = require('../config/constants');
const RESPONSE_MESSAGES = CONSTANTS.responseMessages;

// local modules imported
const Dao = require('../dao').queries;
const Models = require('../models');
const UniversalFunctions = require('../utils').universalFunctions;
const ResponseManager = require('../lib').responseManager;
const Logger = require('./log-manager').logger;


let generateToken = (tokenData, userType) => {
    try {
        let secretKey, expiry;
        switch (userType) {
            case CONSTANTS.appDefaults.AUTH_STRATEGIES.ADMIN:
                secretKey = CONSTANTS.appDefaults.JWT_SECRET.ADMIN;
                expiry = '1d';
                break;
            case CONSTANTS.appDefaults.AUTH_STRATEGIES.USER:
                secretKey = CONSTANTS.appDefaults.JWT_SECRET.USER;
                expiry = '3d';
                break;
            case CONSTANTS.appDefaults.AUTH_STRATEGIES.VENDOR:
                secretKey = CONSTANTS.appDefaults.JWT_SECRET.VENDOR;
                expiry = '1d';
                break;
            default:
                secretKey = CONSTANTS.appDefaults.JWT_SECRET.ADMIN;
        }
        return jwt.sign(tokenData, secretKey, {expiresIn: expiry});
    } catch (err) {
        throw err;
    }
};


let verifyToken = async (tokenData, fromSocket) => {
    let user;
    console.log(tokenData)
    try {
        if (tokenData.scope === CONSTANTS.appDefaults.AUTH_STRATEGIES.ADMIN) {
            user = await Dao.findOne(Models.admin, {
                _id: tokenData._id, issuedAt: tokenData.issuedAt,
                status: {$ne: CONSTANTS.appDefaults.STATUS_ENUM.DELETED}
            }, {__v: 0, password: 0}, {lean: true});
        } else if (tokenData.scope === CONSTANTS.appDefaults.AUTH_STRATEGIES.USER) {
            user = await Dao.findOne(Models.user, {
                _id: tokenData._id/*, issuedAt: tokenData.issuedAt*/,
                status: {$ne: CONSTANTS.appDefaults.STATUS_ENUM.DELETED}
            }, {__v: 0}, {lean: true});
        } else if (tokenData.scope === CONSTANTS.appDefaults.AUTH_STRATEGIES.VENDOR) {
            user = await Dao.findOne(Models.vendors, {
                _id: tokenData._id, issuedAt: tokenData.issuedAt,
                status: {$ne: CONSTANTS.appDefaults.STATUS_ENUM.DELETED}
            }, {__v: 0}, {lean: true});
            if(user && user.parentId && user.userType===CONSTANTS.appDefaults.USER_TYPE.VENDOR_MANAGING_ACCOUNT){
                user = await Dao.findOne(Models.vendors, {
                    _id: user.parentId,
                    status: {$ne: CONSTANTS.appDefaults.STATUS_ENUM.DELETED}
                }, {__v: 0}, {lean: true});
            }
        }


        if (!!user && !!user._id) {
            if (user.status === CONSTANTS.appDefaults.STATUS_ENUM.BLOCKED) {
                if (!fromSocket) throw ResponseManager.sendError("en", RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
                else return {isBlocked: true}
            } else {
                user.scope = tokenData.scope;
                return {
                    isValid: true,
                    credentials: user
                };
            }
        } else {
            if (!fromSocket) throw ResponseManager.sendError("en", RESPONSE_MESSAGES.STATUS_MSG.ERROR.UNAUTHORIZED);
            else return {
                isValid: false,
            }
        }
    } catch (err) {
        console.log("errerrerr", err)
        Logger.error(err);

    }
};


const verifyTokenSocket = async (token, scope) => {
    console.log("token,scope", token, scope)
    try {
        let tokenData = await jwt.verify(token, scope);

        console.log(tokenData)

        return tokenData
    } catch (e) {
        console.log("eeeeeeeeeeeerrrrrrrrr", e)
        return {err: 'Token malformed'}
    }

};

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    verifyTokenSocket: verifyTokenSocket
};
